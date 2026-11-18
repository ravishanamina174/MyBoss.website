import { SignIn } from "@clerk/nextjs";
import { AuthFrame, clerkAppearance } from "@/components/shared/auth-frame";

export default function SignInPage() {
  return (
    <AuthFrame>
      <SignIn fallbackRedirectUrl="/onboarding" appearance={clerkAppearance} />
    </AuthFrame>
  );
}
