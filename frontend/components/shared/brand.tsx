"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

type BrandProps = {
  collapsed?: boolean;
  className?: string;
};

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Brand({
  collapsed = false,
  className = "",
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
      href="/dashboard"
      aria-label="MyBoss home"
      className={`flex min-w-0 items-center ${className}`}
    >
      <Image
        src={logo}
        alt="MyBoss"
        width={collapsed ? 40 : 148}
        height={40}
        priority
        className={
          collapsed
            ? "h-10 w-10 object-contain"
            : "h-9 w-auto max-w-[148px] object-contain"
        }
      />
    </Link>
  );
}