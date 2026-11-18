import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  collapsed?: boolean;
  className?: string;
  href?: string;
};

export function Brand({ collapsed = false, className = "", href = "/dashboard" }: BrandProps) {
  return (
    <Link href={href} aria-label="MyBoss home" className={`myboss-brand ${className}`}>
      <span aria-hidden="true" className="myboss-mark">
        <Image src="/logos/myboss-new-logo.png" alt="" width={1536} height={1024}
          sizes="(min-width: 800px) 360px, 160px" />
      </span>
      {!collapsed && <span className="myboss-wordmark">myboss</span>}
    </Link>
  );
}
