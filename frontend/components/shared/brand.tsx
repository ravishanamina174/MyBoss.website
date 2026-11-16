"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

type BrandProps = {
  collapsed?: boolean;
  className?: string;
  href?: string;
};

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Brand({
  collapsed = false,
  className = "",
  href = "/dashboard",
}: BrandProps) {
  const { resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const logo =
    mounted && resolvedTheme === "dark"
      ? "/logos/myboss-dark.png"
      : "/logos/myboss-light.png";

  return (
    <Link
      href={href}
      aria-label="MyBoss home"
      className={`flex min-w-0 items-center ${className}`}
    >
      <Image
        src={logo}
        alt="MyBoss"
        width={64}
        height={64}
        priority
        className={`shrink-0 object-contain ${
          collapsed ? "h-8 w-8" : "h-8 w-8"
        }`}
      />
      {!collapsed && (
        <span className="ml-1.5 text-[15px] font-semibold tracking-[-0.03em] text-sidebar-foreground">
          myboss
        </span>
      )}
    </Link>
  );
}
