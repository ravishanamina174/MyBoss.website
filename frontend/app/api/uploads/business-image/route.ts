import { auth } from "@clerk/nextjs/server";
import { createHash, createHmac, randomUUID } from "node:crypto";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  const { userId, getToken } = await auth();
  if (!userId) return Response.json({ error: "Sign in required" }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 9 * 1024 * 1024) {
    return Response.json({ error: "Image must be under 8 MB" }, { status: 413 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const businessId = form.get("businessId");
  if (!(file instanceof File) || typeof businessId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(businessId)) {
    return Response.json({ error: "Invalid image upload" }, { status: 400 });
  }
  const extension = allowedTypes[file.type];
  if (!extension || file.size === 0 || file.size > 8 * 1024 * 1024) {
    return Response.json({ error: "Choose a JPG, PNG, WebP, or AVIF image under 8 MB" }, { status: 400 });
  }

  const token = await getToken();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!token || !apiUrl) return Response.json({ error: "Authentication unavailable" }, { status: 401 });
  const membership = await fetch(`${apiUrl}/api/businesses/${businessId}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  if (!membership.ok) return Response.json({ error: "Business access denied" }, { status: 403 });
  const business = await membership.json() as { role?: string };
  if (business.role !== "OWNER") return Response.json({ error: "Only owners can upload business images" }, { status: 403 });

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    return Response.json({ error: "Image storage is not configured" }, { status: 503 });
  }
  let publicUrl: URL;
  try {
    publicUrl = new URL(R2_PUBLIC_URL);
    if (publicUrl.protocol !== "https:") throw new Error("HTTPS required");
  } catch {
    return Response.json({ error: "Image storage public URL is invalid" }, { status: 503 });
  }

  const key = `businesses/${businessId}/${randomUUID()}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());
  const isValidImage = file.type === "image/jpeg"
    ? body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff
    : file.type === "image/png"
      ? body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : file.type === "image/webp"
        ? body.toString("ascii", 0, 4) === "RIFF" && body.toString("ascii", 8, 12) === "WEBP"
        : body.toString("ascii", 4, 12) === "ftypavif";
  if (!isValidImage) return Response.json({ error: "File content is not a supported image" }, { status: 400 });
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const path = `/${encodeURIComponent(R2_BUCKET_NAME)}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = timestamp.slice(0, 8);
  const payloadHash = createHash("sha256").update(body).digest("hex");
  const scope = `${date}/auto/s3/aws4_request`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${timestamp}\n`;
  const canonical = `PUT\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${createHash("sha256").update(canonical).digest("hex")}`;
  const hmac = (secret: Buffer | string, value: string) => createHmac("sha256", secret).update(value).digest();
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${R2_SECRET_ACCESS_KEY}`, date), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  try {
    const upload = await fetch(`https://${host}${path}`, {
      method: "PUT",
      headers: {
        Authorization: `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": timestamp,
        "Content-Type": file.type,
      },
      body,
    });
    if (!upload.ok) throw new Error(`R2 upload failed with ${upload.status}`);
  } catch {
    return Response.json({ error: "Image upload failed. Please try again." }, { status: 502 });
  }
  return Response.json({ url: `${publicUrl.toString().replace(/\/$/, "")}/${key}` });
}
