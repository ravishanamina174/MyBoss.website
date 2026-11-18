"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, BarChart3, Check, ChevronDown,
  ClipboardList, DoorOpen, Leaf, Menu, Store, Sun, Users, X } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { HeroFilm } from "./hero-film";
import "./landing.css";

const productLinks = [
  { name: "Tasks", href: "#tour", icon: ClipboardList, color: "peach" },
  { name: "Team", href: "#team", icon: Users, color: "lilac" },
  { name: "Reports", href: "#reports", icon: BarChart3, color: "mint" },
  { name: "Business profile", href: "#profile", icon: Store, color: "blue" },
];

function DashboardLink({ children = "Open Dashboard", className }: { children?: ReactNode; className?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const href = isLoaded && isSignedIn ? "/onboarding" : "/sign-in?redirect_url=%2Fonboarding";
  return <Link className={className} href={href}>{children}</Link>;
}

function Header() {
  const [open, setOpen] = useState<"product" | "mobile" | null>(null);
  const productToggle = useRef<HTMLButtonElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(null);
  return (
    <header className="site-head" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) close();
    }} onKeyDown={(event) => {
      if (open && event.key === "Escape") {
        (open === "mobile" ? menuToggle : productToggle).current?.focus();
        close();
      }
    }}>
      <div className="head-row">
        <Brand href="/" />
        <nav aria-label="Main" className="desktop-links">
          <button ref={productToggle} type="button" aria-expanded={open === "product"} aria-controls="product-menu"
            onClick={() => setOpen(open === "product" ? null : "product")}>Product <ChevronDown size={15} /></button>
          <a href="#how-it-works" onClick={close}>How it works</a><a href="#pricing" onClick={close}>Pricing</a>
        </nav>
        <div className="head-actions"><Link href="/sign-in" className="sign-link">Sign in</Link>
          <DashboardLink className="action primary" />
          <button ref={menuToggle} type="button" className="mobile-toggle" aria-label={open === "mobile" ? "Close navigation" : "Open navigation"}
            aria-expanded={open === "mobile"} aria-controls="mobile-menu" onClick={() => setOpen(open === "mobile" ? null : "mobile")}>
            {open === "mobile" ? <X /> : <Menu />}</button>
        </div>
      </div>
      <nav id="product-menu" className="product-menu" aria-label="Product" hidden={open !== "product"}>
        {productLinks.map(({ name, href, color, icon: Icon }) => <a key={name} href={href} onClick={close}><i className={color}><Icon size={19} /></i>{name}</a>)}
      </nav>
      <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile" hidden={open !== "mobile"}>
        {productLinks.map(({ name, href }) => <a key={name} href={href} onClick={close}>{name}<ArrowUpRight size={16} /></a>)}
        <a href="#how-it-works" onClick={close}>How it works</a><a href="#pricing" onClick={close}>Pricing</a>
        <Link href="/sign-in" onClick={close}>Sign in</Link>
      </nav>
    </header>
  );
}

function ProductStories() {
  return (
    <section className="stories page-width" id="features">
      <h2>The work behind<br />your workday.</h2>
      <div className="story-grid">
        <article className="story team-story" id="team">
          <span className="category"><Users size={18} /> Team management</span>
          <h3>Put a name to every task.</h3><p>Invite your staff, assign work, and give each person a clear view of what’s theirs.</p>
          <div className="paper team-paper" aria-label="Example team assignments">
            <strong>On the floor</strong>
            {[["M", "Maya", "Front display", "peach"], ["J", "Jules", "Till count", "lilac"], ["A", "Anu", "Delivery", "blue"]].map(([letter, name, task, color]) => (
              <div className="person" key={name}><i className={color}>{letter}</i><b>{name}</b><span>{task}</span></div>
            ))}
          </div>
        </article>
        <article className="story report-story" id="reports">
          <span className="category"><BarChart3 size={18} /> Activity reports</span>
          <h3>See how the week went.</h3><p>Follow tasks created and completed over time. Spot the days your team has more on its plate.</p>
          <div className="paper chart-paper" role="img" aria-label="Example weekly report with created and completed tasks for five days">
            <strong>Task activity</strong>
            <div className="chart-key"><span>Created</span><span>Completed</span></div>
            <div className="chart">{[[52, 34], [64, 43], [47, 58], [85, 68], [71, 83]].map(([a, b], index) =>
              <div key={index}><span><i style={{height: a}} /><i style={{height: b}} /></span><small>{["Mon", "Tue", "Wed", "Thu", "Fri"][index]}</small></div>)}</div>
          </div>
        </article>
        <article className="story profile-story" id="profile">
          <div><span className="category"><Store size={18} /> Public profile</span>
            <h3>Give customers<br />your calling card.</h3>
            <p>Publish your business details and share a digital card with the people who need to find you.</p></div>
          <div className="profile-example"><span className="card-awning" aria-hidden="true" />
            <Store size={28} strokeWidth={1.6} /><strong>Maple Street Market</strong><span>Groceries &amp; fresh produce</span>
            <div><Leaf size={16} /> Independent grocer</div>
          </div>
        </article>
      </div>
    </section>
  );
}

const steps = [
  ["Create your workspace", "Register your business and choose the workspace you want to manage.", Store, "blue"],
  ["Bring your team in", "Share an invitation link so staff can join and see their assignments.", Users, "lilac"],
  ["Assign the first task", "Choose an owner, set a due date, and follow the task through to completion.", Check, "mint"],
] as const;

export function LandingPage() {
  return (
    <div className="mb-site" id="top">
      <a className="skip-site" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className="intro" aria-labelledby="hero-title">
          <div className="intro-copy">
            <h1 id="hero-title">Small team.<br />Big <span className="headline-chip"><Sun aria-hidden="true" />plans.</span></h1>
            <p>Run the day together. Organize tasks, coordinate staff, and track progress in one small-business workspace.</p>
            <div className="intro-actions"><DashboardLink className="action primary" /><a className="action secondary" href="#tour">See it in action <ArrowDown size={16} /></a></div>
          </div>
          <div className="showcase">
            <Image className="margin-art owner-art" src="/media/shop-owner.webp" width={230} height={340} alt="" />
            <Image className="margin-art crew-art" src="/media/shop-crew.webp" width={230} height={340} alt="" />
            <HeroFilm />
          </div>
        </section>
        <ProductStories />
        <section className="setup page-width" id="how-it-works">
          <div><h2>From opening up<br />to closing time.</h2><p>Set up your workspace in three steps.</p></div>
          <ol>{steps.map(([title, detail, Icon, color], index) => <li key={title}>
            <i className={color}><Icon size={21} /></i><div><small>Step {index + 1}</small><h3>{title}</h3><p>{detail}</p></div>
          </li>)}</ol>
        </section>
        <section className="pricing page-width" id="pricing">
          <div><span className="category"><DoorOpen size={19} /> Workspace access</span>
            <h2>Ready for your next shift?</h2><p>Explore MyBoss without a payment today. Pricing details are coming soon.</p></div>
          <DashboardLink className="action primary">Open Dashboard <ArrowRight size={17} /></DashboardLink>
        </section>
      </main>
      <footer className="site-footer">
        <div className="page-width footer-inner">
          <div className="footer-links"><div className="footer-note"><Brand href="/" /><p>The everyday workspace<br />for small businesses.</p></div>
            <nav aria-label="Product links"><h3>Product</h3>{productLinks.map(({ name, href }) => <a key={name} href={href}>{name}</a>)}</nav>
            <nav aria-label="Explore"><h3>Explore</h3><a href="#tour">Product film</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a></nav>
            <nav aria-label="Workspace"><h3>Workspace</h3><DashboardLink /><Link href="/sign-in">Sign in</Link><Link href="/sign-up">Create an account</Link></nav>
          </div>
          <Brand href="/" className="footer-signature" />
          <div className="footer-base"><span>© {new Date().getFullYear()} MyBoss</span><a href="#top">Back to top <ArrowUp size={14} /></a></div>
        </div>
      </footer>
    </div>
  );
}
