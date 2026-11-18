"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState, type ReactNode } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BarChart3, BellRing, Building2,
  Check, ClipboardCheck, Menu, ShieldCheck, Store, Users, X,
} from "lucide-react";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { HeroFilm } from "./hero-film";
import "./landing.css";

const navigation = [
  ["Why MyBoss", "#why"],
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
];

const features = [
  {
    icon: ClipboardCheck, title: "Task management", tone: "blue",
    description: "Set priorities, assign work and see what’s due in one place.",
  },
  {
    icon: Users, title: "Team management", tone: "green",
    description: "Invite staff and give each person access to the work they’re responsible for.",
  },
  {
    icon: BarChart3, title: "Reports", tone: "indigo",
    description: "Review task activity and completions to see how work is moving.",
  },
  {
    icon: BellRing, title: "Notifications", tone: "amber",
    description: "Keep up with assignments, completions and other changes as they happen.",
  },
  {
    icon: Store, title: "Business profile", tone: "clay",
    description: "Publish a business page and a digital business card you can share with customers.",
  },
  {
    icon: ShieldCheck, title: "Role-based access", tone: "slate",
    description: "Owners manage the workspace. Staff see the tools they need for their work.",
  },
];

const steps = [
  ["Register your business", "Create your workspace with your business name."],
  ["Add your first tasks", "Write down the work and set due dates so priorities are clear."],
  ["Invite your staff", "Share an invitation link to bring the team into your workspace."],
  ["Track what gets done", "Follow task updates and check reports to see how the team is doing."],
];

const exampleTasks = [
  ["Check stock before opening", "Done"],
  ["Confirm the weekend roster", "Pending"],
  ["Review the supplier delivery", "Pending"],
];

function DashboardLink({ children, className, onClick }: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const href = isLoaded && isSignedIn ? "/onboarding" : "/sign-in?redirect_url=%2Fonboarding";
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}

function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="marketing-header" onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        closeMenu();
        event.currentTarget.querySelector<HTMLButtonElement>(".marketing-menu-toggle")?.focus();
      }
    }}>
      <div className="marketing-wrap marketing-header-row">
        <Brand href="/" className="marketing-brand" />
        <nav className="marketing-desktop-nav" aria-label="Main navigation">
          {navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="marketing-actions">
          <ThemeToggle />
          <Link className="marketing-signin" href="/sign-in">Sign in</Link>
          <DashboardLink className="marketing-button marketing-button-outline marketing-desktop-cta">
            Open dashboard <ArrowUpRight size={16} />
          </DashboardLink>
          <button
            type="button"
            className="marketing-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-controls="marketing-mobile-nav"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <nav
        className="marketing-mobile-nav marketing-wrap"
        aria-label="Mobile navigation"
        id="marketing-mobile-nav"
        hidden={!menuOpen}
      >
        {navigation.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
        <Link href="/sign-in" onClick={closeMenu}>Sign in</Link>
        <DashboardLink className="marketing-button marketing-button-blue" onClick={closeMenu}>Open dashboard <ArrowUpRight size={16} /></DashboardLink>
      </nav>
    </header>
  );
}

function TaskPreview() {
  return (
    <figure className="marketing-preview">
      <figcaption className="preview-chrome">
        <span><ClipboardCheck size={18} /> Tasks</span>
        <small>Example workspace</small>
      </figcaption>
      <div className="preview-list">
        {exampleTasks.map(([task, status]) => (
          <div className="preview-task" key={task}>
            <span className={status === "Done" ? "preview-check is-done" : "preview-check"} aria-hidden="true">
              {status === "Done" && <Check size={13} />}
            </span>
            <span>{task}</span>
            <span className={status === "Done" ? "preview-status is-done" : "preview-status"}>{status}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function LandingPage() {
  return (
    <div className="marketing" id="top">
      <a className="marketing-skip sr-only focus:not-sr-only" href="#main-content">Skip to content</a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        <div className="marketing-wrap hero-wrap">
          <section className="marketing-hero" aria-labelledby="hero-title">
            <HeroFilm />
            <div className="hero-copy">
              <p className="hero-label">The small business workspace</p>
              <h1 id="hero-title">Keep your business<br className="hero-break" /> moving.</h1>
              <p className="hero-summary">Assign tasks, coordinate your team, and see what’s getting done. All from one workspace.</p>
              <div className="hero-actions">
                <DashboardLink className="marketing-button marketing-button-white">Open your workspace <ArrowUpRight size={17} /></DashboardLink>
                <a href="#features" className="marketing-button marketing-button-glass">Explore features <ArrowDown size={16} /></a>
              </div>
            </div>
          </section>
        </div>

        <section id="why" className="marketing-wrap marketing-section why-section">
          <div className="section-copy">
            <p className="section-label">Why MyBoss</p>
            <h2>See what needs<br className="hero-break" /> your attention.</h2>
            <p>Give your team a shared view of the work. Know who’s handling each task, what’s due, and what’s already done.</p>
          </div>
          <TaskPreview />
        </section>

        <section id="features" className="feature-section">
          <div className="marketing-wrap marketing-section">
            <div className="section-copy">
              <p className="section-label">Features</p>
              <h2>Tools for the workday.</h2>
            </div>
            <div className="marketing-feature-grid">
              {features.map(({ icon: Icon, title, description, tone }) => (
                <article className="marketing-feature" key={title}>
                  <span className="marketing-feature-icon" data-tone={tone}><Icon size={22} strokeWidth={1.75} /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="steps-section">
          <div className="marketing-wrap marketing-section">
            <div className="section-copy">
              <p className="section-label">How it works</p>
              <h2>From setup<br className="hero-break" /> to the first task.</h2>
              <DashboardLink className="marketing-button marketing-button-white">Get started <ArrowUpRight size={17} /></DashboardLink>
            </div>
            <ol className="marketing-steps">
              {steps.map(([title, description], index) => (
                <li key={title}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="marketing-wrap marketing-section pricing-section">
          <div className="section-copy">
            <p className="section-label">Pricing</p>
            <h2>Explore MyBoss today.</h2>
            <p>Workspace pricing is coming soon. You can explore MyBoss now without making a payment.</p>
          </div>
          <DashboardLink className="marketing-button marketing-button-blue">Open dashboard <ArrowUpRight size={17} /></DashboardLink>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-wrap">
          <div className="marketing-footer-callout">
            <div><Building2 size={24} aria-hidden="true" /><h2>Bring your team into one workspace.</h2></div>
            <DashboardLink className="marketing-button marketing-button-white">Open your workspace <ArrowRight size={17} /></DashboardLink>
          </div>
          <div className="marketing-footer-main">
            <div>
              <Brand href="/" className="marketing-brand" />
              <p>Tasks, people, and progress in one place for small businesses.</p>
            </div>
            <nav aria-label="Platform">
              <h3>Platform</h3>
              {navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
            </nav>
            <nav aria-label="Account">
              <h3>Account</h3>
              <Link href="/sign-in">Sign in</Link>
              <Link href="/sign-up">Create an account</Link>
              <DashboardLink>Open dashboard</DashboardLink>
            </nav>
          </div>
          <div className="marketing-footer-bottom">
            <span>© {new Date().getFullYear()} MyBoss</span>
            <a href="#top">Back to top <ArrowUpRight size={14} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
