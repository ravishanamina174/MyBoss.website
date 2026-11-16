"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  ChevronDown,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";

const features = [
  {
    icon: ClipboardCheck,
    title: "Keep work moving",
    description:
      "Create clear tasks, set due dates, and see what needs attention without chasing updates.",
  },
  {
    icon: Users,
    title: "Bring your team together",
    description:
      "Invite staff into one focused workspace with the right visibility for every role.",
  },
  {
    icon: BellRing,
    title: "Stay ahead of changes",
    description:
      "Get useful notifications when work is assigned, completed, or needs a decision.",
  },
  {
    icon: Store,
    title: "Make your business official",
    description:
      "Keep your business profile and digital business card details ready to share.",
  },
  {
    icon: BarChart3,
    title: "Learn from the work",
    description:
      "Use straightforward reports to understand progress, capacity, and team performance.",
  },
  {
    icon: ShieldCheck,
    title: "Built with sensible access",
    description:
      "Owners stay in control while staff get the tools and information they need to do great work.",
  },
];

const steps = [
  {
    number: "01",
    title: "Register your business",
    description: "Start with your business name and create your workspace in minutes.",
  },
  {
    number: "02",
    title: "Set up your rhythm",
    description: "Add tasks, clarify responsibilities, and make your daily priorities visible.",
  },
  {
    number: "03",
    title: "Invite your staff",
    description: "Share a secure invitation so your team can join the same source of truth.",
  },
  {
    number: "04",
    title: "Run the day with confidence",
    description: "Track progress, celebrate completions, and use reports to improve tomorrow.",
  },
];

function Logo() {
  return (
    <Link href="/" aria-label="MyBoss home" className="flex items-center gap-2.5">
      <Image
        src="/logos/myboss-light.png"
        alt="MyBoss"
        width={36}
        height={36}
        className="h-9 w-9 object-contain dark:hidden"
        priority
      />
      <Image
        src="/logos/myboss-dark.png"
        alt=""
        width={36}
        height={36}
        className="hidden h-9 w-9 object-contain dark:block"
        priority
      />
      <span className="text-lg font-bold tracking-[-0.04em]">MyBoss</span>
    </Link>
  );
}

function DashboardLink({
  className = "",
  children = "Open dashboard",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const href =
    isLoaded && isSignedIn
      ? "/onboarding"
      : "/sign-in?redirect_url=%2Fonboarding";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main className="overflow-hidden bg-[#fbfaf9] text-[#202124] dark:bg-[#101011] dark:text-[#f7f7f7]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-[#fbfaf9]/85 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#101011]/85">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#68696c] lg:flex dark:text-[#b2b2b8]">
            <a href="#why" className="transition hover:text-[#202124] dark:hover:text-white">
              Why MyBoss
            </a>
            <a href="#how-it-works" className="transition hover:text-[#202124] dark:hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="transition hover:text-[#202124] dark:hover:text-white">
              Pricing
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#68696c] transition hover:bg-black/[0.04] hover:text-[#202124] dark:text-[#b2b2b8] dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              Sign in
            </Link>
            <DashboardLink className="inline-flex items-center gap-2 rounded-full bg-[#e51b36] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(229,27,54,0.2)] transition hover:-translate-y-0.5 hover:bg-[#c91630]">
              Open dashboard <ArrowRight className="h-4 w-4" />
            </DashboardLink>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 lg:hidden dark:border-white/10"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-black/[0.06] px-5 py-5 lg:hidden dark:border-white/[0.08]">
            <nav className="flex flex-col gap-1">
              {[
                ["Why MyBoss", "#why"],
                ["How it works", "#how-it-works"],
                ["Pricing", "#pricing"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-[#68696c] hover:bg-black/[0.04] dark:text-[#b2b2b8] dark:hover:bg-white/[0.06]"
                >
                  {label}
                </a>
              ))}
              <div className="mt-3 flex items-center gap-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
                <ThemeToggle />
                <Link href="/sign-in" onClick={closeMenu} className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-center text-sm font-semibold dark:border-white/10">
                  Sign in
                </Link>
                <DashboardLink
                  className="flex-1 rounded-full bg-[#e51b36] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Open dashboard
                </DashboardLink>
              </div>
            </nav>
          </div>
        )}
      </header>

      <section className="relative px-5 pb-20 pt-36 sm:px-8 sm:pt-44 lg:px-10 lg:pb-28">
        <div className="absolute left-1/2 top-[-160px] -z-0 h-[540px] w-[760px] -translate-x-1/2 rounded-full bg-[#ffb8c2]/30 blur-3xl dark:bg-[#9d172d]/20" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#e51b36]/20 bg-[#fff0f2] px-3.5 py-1.5 text-xs font-semibold text-[#b8142b] dark:bg-[#35171e] dark:text-[#ff8294]">
              <Sparkles className="h-3.5 w-3.5" />
              Operations, without the overhead
            </div>
            <h1 className="text-balance text-5xl font-bold leading-[0.98] tracking-[-0.07em] sm:text-7xl lg:text-[88px]">
              Run the business.
              <span className="block text-[#e51b36]">Own the momentum.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#68696c] sm:text-xl dark:text-[#b2b2b8]">
              MyBoss gives small business owners one calm, clear place to organize work, lead their team, and make better decisions every day.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <DashboardLink className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e51b36] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(229,27,54,0.22)] transition hover:-translate-y-0.5 hover:bg-[#c91630] sm:w-auto">
                Start running smarter <ArrowRight className="h-4 w-4" />
              </DashboardLink>
              <a href="#features" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-6 py-3.5 text-sm font-semibold transition hover:border-black/20 hover:bg-white sm:w-auto dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.08]">
                Explore features <ChevronDown className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-[#8b8c90]">Designed for the businesses that keep communities moving.</p>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section id="why" className="scroll-mt-24 border-y border-black/[0.06] bg-white/65 px-5 py-20 sm:px-8 lg:px-10 lg:py-28 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e51b36]">Why MyBoss</p>
            <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-[-0.055em] sm:text-5xl">
              Less scattered work. More room to lead.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              ["Stop operating from memory", "Replace message threads, sticky notes, and guesswork with a shared view of what matters now."],
              ["Make every handoff clearer", "Give your team context, ownership, and next steps so small details do not become expensive delays."],
              ["Know what is really happening", "Simple activity and performance signals help you make decisions from the work itself."],
              ["Build a business that can grow", "Create repeatable operating habits without adding enterprise complexity to your day."],
            ].map(([title, description]) => (
              <div key={title} className="border-l-2 border-[#e51b36]/30 pl-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#68696c] dark:text-[#b2b2b8]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e51b36]">Everything in one rhythm</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">The practical toolkit for your next good day.</h2>
            <p className="mt-5 text-lg leading-8 text-[#68696c] dark:text-[#b2b2b8]">A focused workspace for the work owners and staff actually do—not a maze of features you never use.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className={`rounded-3xl border p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04] dark:hover:shadow-black/20 ${index === 0 ? "border-[#e51b36]/30 bg-[#fff4f5] dark:bg-[#2a1418]" : "border-black/[0.08] bg-white/60 dark:border-white/[0.08] dark:bg-white/[0.03]"}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e51b36]/10 text-[#e51b36]"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-6 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#68696c] dark:text-[#b2b2b8]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-[#202124] px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff8294]">How it works</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.055em] sm:text-5xl">Simple enough to start today.</h2>
            <p className="mt-5 max-w-md leading-7 text-white/65">MyBoss meets you where your business is now and gives you a clear path to the next level.</p>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.number} className="border-t border-white/15 py-6 sm:pr-8">
                <span className="text-sm font-semibold text-[#ff8294]">{step.number}</span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e51b36]/20 bg-[#fff4f5] p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12 dark:bg-[#291318]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e51b36]">Pricing</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em]">Start focused. Grow when you are ready.</h2>
            <p className="mt-4 max-w-xl leading-7 text-[#68696c] dark:text-[#b2b2b8]">We are shaping a simple plan for growing local businesses. The full MyBoss workspace is available to explore while we prepare the next release.</p>
          </div>
          <div className="mt-8 shrink-0 rounded-2xl border border-[#e51b36]/20 bg-white p-6 lg:mt-0 dark:bg-[#191314]">
            <p className="text-sm font-semibold text-[#68696c] dark:text-[#b2b2b8]">Workspace access</p>
            <p className="mt-2 text-3xl font-bold">Coming soon</p>
            <p className="mt-2 text-xs text-[#8b8c90]">No payment required today.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#e51b36] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:py-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Your next operating system</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-[-0.055em] sm:text-5xl">Make the work visible. Make the progress real.</h2>
          </div>
          <DashboardLink className="mt-8 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#c91630] transition hover:bg-[#fff0f2] lg:mt-0">
            Open your workspace <ArrowRight className="h-4 w-4" />
          </DashboardLink>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] px-5 py-10 sm:px-8 lg:px-10 dark:border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#68696c] dark:text-[#b2b2b8]">A calmer way for small businesses to organize work, lead people, and keep moving.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#68696c] dark:text-[#b2b2b8]">
            <a href="#why" className="hover:text-[#e51b36]">Why MyBoss</a>
            <a href="#features" className="hover:text-[#e51b36]">Features</a>
            <a href="#pricing" className="hover:text-[#e51b36]">Pricing</a>
            <a href="mailto:hello@myboss.example" className="hover:text-[#e51b36]">Contact</a>
            <Link href="/sign-in" className="hover:text-[#e51b36]">Sign in</Link>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-black/[0.06] pt-5 text-xs text-[#8b8c90] sm:flex-row sm:justify-between dark:border-white/[0.08]">
          <span>© {new Date().getFullYear()} MyBoss. Built for better business days.</span>
          <span>Privacy and terms information coming soon.</span>
        </div>
      </footer>
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="mx-auto mt-20 max-w-5xl [perspective:1200px]">
      <div className="relative rotate-1 rounded-[1.75rem] border border-black/10 bg-white p-2 shadow-[0_35px_80px_rgba(32,33,36,0.16)] dark:border-white/10 dark:bg-[#191919] dark:shadow-black/40 sm:p-3">
        <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-[#f7f7f8] dark:border-white/[0.08] dark:bg-[#101010]">
          <div className="flex h-12 items-center justify-between border-b border-black/[0.07] bg-white px-4 dark:border-white/[0.08] dark:bg-[#191919] sm:px-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#e51b36]" />
              <span className="text-xs font-semibold">MyBoss workspace</span>
            </div>
            <div className="h-7 w-7 rounded-full bg-[#f4e9eb] dark:bg-[#35171e]" />
          </div>
          <div className="grid min-h-[300px] grid-cols-[52px_1fr] sm:grid-cols-[170px_1fr]">
            <aside className="border-r border-black/[0.07] bg-white p-3 dark:border-white/[0.08] dark:bg-[#191919] sm:p-5">
              <div className="hidden h-2.5 w-20 rounded bg-black/10 dark:bg-white/10 sm:block" />
              <div className="mt-8 space-y-3">
                {[LayoutDashboard, ClipboardCheck, Users, BarChart3].map((Icon, index) => (
                  <div key={index} className={`flex items-center gap-3 rounded-lg p-2 ${index === 0 ? "bg-[#f4e9eb] text-[#e51b36] dark:bg-[#35171e]" : "text-[#8b8c90]"}`}>
                    <Icon className="mx-auto h-4 w-4 sm:mx-0" />
                    <span className="hidden text-[11px] font-medium sm:block">{["Overview", "Tasks", "Staff", "Reports"][index]}</span>
                  </div>
                ))}
              </div>
            </aside>
            <div className="p-5 sm:p-8">
              <div className="flex items-end justify-between">
                <div><p className="text-[11px] text-[#8b8c90]">Business overview</p><p className="mt-1 text-lg font-bold sm:text-2xl">Good morning, owner.</p></div>
                <div className="hidden rounded-lg bg-[#e51b36] px-3 py-2 text-[10px] font-semibold text-white sm:block">New task</div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[["Active tasks", "24"], ["Completed", "86%"], ["Team members", "08"]].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-black/[0.07] bg-white p-3 dark:border-white/[0.08] dark:bg-[#191919]"><p className="text-[10px] text-[#8b8c90]">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.08] dark:bg-[#191919]">
                <div className="flex items-center justify-between"><p className="text-xs font-semibold">Today&apos;s priorities</p><span className="text-[10px] text-[#e51b36]">View all</span></div>
                {["Review supplier delivery", "Prepare Saturday schedule", "Follow up with customer"].map((task, index) => (
                  <div key={task} className="mt-4 flex items-center gap-3 text-xs"><div className={`flex h-4 w-4 items-center justify-center rounded-full border ${index === 0 ? "border-[#e51b36] bg-[#e51b36] text-white" : "border-black/15 dark:border-white/20"}`}>{index === 0 && <Check className="h-3 w-3" />}</div><span className={index === 0 ? "text-[#8b8c90] line-through" : ""}>{task}</span><span className="ml-auto text-[10px] text-[#8b8c90]">{index + 1}d</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
