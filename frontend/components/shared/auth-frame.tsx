import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Users, ChartNoAxesColumn } from "lucide-react";
import type { ReactNode } from "react";

import { Brand } from "./brand";
import "./auth.css";

export const clerkAppearance = {
  elements: {
    rootBox: "myboss-clerk-root",
    cardBox: "myboss-clerk-card-box",
    card: "myboss-clerk-card",
    footer: "myboss-clerk-footer",
  },
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorBackground: "var(--card)",
    colorForeground: "var(--foreground)",
    colorMutedForeground: "var(--muted-foreground)",
    colorInput: "var(--input-bg)",
    colorInputForeground: "var(--foreground)",
    colorBorder: "var(--border)",
    fontFamily: "var(--font-inter), sans-serif",
    borderRadius: "7px",
  },
};

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="myboss-auth">
      <header className="myboss-auth-header">
        <Brand href="/" className="myboss-auth-brand" />
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>
      </header>
      <main className="myboss-auth-layout">
        <div className="myboss-auth-side">
          <p>MyBoss workspace</p>
          <strong>Keep the whole day in view.</strong>
          <ul>
            <li><ClipboardCheck size={18} /> Assign and track tasks</li>
            <li><Users size={18} /> Coordinate with your team</li>
            <li><ChartNoAxesColumn size={18} /> See what’s getting done</li>
          </ul>
        </div>
        <div className="myboss-auth-content">{children}</div>
      </main>
    </div>
  );
}
