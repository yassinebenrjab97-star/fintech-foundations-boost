import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Languages, Menu, X, ArrowUpRight, ArrowRight } from "lucide-react";
import logo from "@/assets/sahloul-emblem.webp";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGES } from "@/i18n/locales";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/domain";
import Assistant from "./assistant";

export const LOGO_URL = logo;

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key,value");
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
    },
  });
}

/** Emblem on a white disc, like an enamel plaque. */
export function Emblem({ className, ring = true }: { className?: string; ring?: boolean }) {
  return (
    <span className={cn("relative inline-grid place-items-center rounded-full bg-plaque shrink-0", ring && "ring-1 ring-foreground/10", className)}>
      <img src={LOGO_URL} alt="" className="h-[88%] w-[88%] object-contain" />
    </span>
  );
}

export function LangSwitch({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  return (
    <label className={cn("relative inline-flex items-center gap-1.5 text-xs font-semibold", className)}>
      <Languages className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-transparent py-1 pe-1 focus:outline-none cursor-pointer"
        aria-label={t("common.language")}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-paper text-foreground">{l.label}</option>
        ))}
      </select>
    </label>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  return (
    <button onClick={toggle} aria-label={t("common.theme")} className={cn("p-1.5 rounded-md hover:bg-foreground/10", className)}>
      {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}

function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/reclamation", label: t("nav.complaint") },
    { to: "/suivi", label: t("nav.track") },
    { to: "/materiel-reforme", label: t("nav.reformed") },
  ];
  return (
    <header className="sticky top-0 z-40">
      {/* Utility band */}
      <div className="bg-panel text-panel-foreground">
        <div className="container flex h-9 items-center gap-4">
          <span className="h-full w-1.5 bg-accent" aria-hidden />
          <p className="eyebrow !text-panel-muted truncate">{t("common.hospital")} · {t("common.city")}</p>
          <div className="ms-auto flex items-center gap-2">
            <LangSwitch />
            <span className="h-4 w-px bg-panel-foreground/20" aria-hidden />
            <ThemeToggle className="hover:bg-panel-foreground/10" />
          </div>
        </div>
      </div>
      {/* Main bar */}
      <div className="bg-paper/90 backdrop-blur-md border-b border-foreground/10">
        <div className="container flex items-center gap-4 py-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <Emblem className="h-11 w-11" />
            <span className="leading-none min-w-0">
              <span className="block sign-caps text-[15px] tracking-tight truncate">{t("common.dept")}</span>
              <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />IT Desk
              </span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ms-auto text-sm font-medium" aria-label="Navigation">
            {links.map((l, i) => (
              <NavLink key={l.to} to={l.to} end
                className={({ isActive }) => cn("group flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                  isActive ? "bg-panel text-panel-foreground" : "hover:bg-foreground/5")}>
                {({ isActive }) => (<>
                  <span className={cn("font-mono text-[10px]", isActive ? "text-accent" : "text-muted-foreground")}>0{i + 1}</span>{l.label}
                </>)}
              </NavLink>
            ))}
          </nav>
          <button className="lg:hidden ms-auto p-2 rounded-md hover:bg-foreground/5" onClick={() => setOpen(!open)} aria-label={t("nav.menu")} aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="lg:hidden container pb-4 flex flex-col" onClick={() => setOpen(false)}>
            {links.map((l, i) => (
              <NavLink key={l.to} to={l.to} end className={({ isActive }) => cn("flex items-center gap-4 py-3.5 border-t border-foreground/10 font-wide font-bold text-lg uppercase", isActive && "text-secondary")}>
                <span className="picto h-7 w-7 bg-panel text-panel-foreground text-[11px]">{i + 1}</span>{l.label}
                <ArrowRight className="ms-auto h-4 w-4 rtl:rotate-180" />
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  const { data: s } = useSettings();
  return (
    <footer className="mt-28 bg-panel text-panel-foreground border-t-4 border-accent">
      <div className="container py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex items-start gap-4">
          <Emblem className="h-16 w-16" ring={false} />
          <div>
            <p className="sign-caps text-2xl">{t("common.dept")}</p>
            <p className="mt-2 text-sm text-panel-muted">{t("common.hospital")} — {t("common.city")}</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {[["/reclamation", t("nav.complaint")], ["/suivi", t("nav.track")], ["/materiel-reforme", t("nav.reformed")]].map(([to, l]) => (
            <li key={to}><Link to={to} className="inline-flex items-center gap-2 hover:text-accent"><ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />{l}</Link></li>
          ))}
        </ul>
        <div className="text-sm space-y-1.5 font-mono md:text-end">
          {s?.phone && <p><a className="link-u" href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a>{s.extension && <span className="text-panel-muted"> · {s.extension}</span>}</p>}
          {s?.email && <p><a className="link-u" href={`mailto:${s.email}`}>{s.email}</a></p>}
          {s?.hours && <p className="text-panel-muted">{s.hours}</p>}
        </div>
      </div>
      <div className="border-t border-panel-foreground/10">
        <div className="container py-4 flex flex-wrap justify-between gap-2 eyebrow !text-panel-muted">
          <span>© {new Date().getFullYear()} · {t("footer.rights")}</span>
          <span>Sahloul IT Desk</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 bg-accent px-3 py-2 z-50">Skip</a>
      <Header />
      <main id="main" key={pathname} className="flex-1 animate-fade-up">
        <Outlet />
      </main>
      <Footer />
      <Assistant />
    </div>
  );
}

export function PageTitle({ eyebrow, title, intro, n }: { eyebrow: string; title: string; intro?: string; n?: number }) {
  return (
    <div className="container pt-6 md:pt-10">
      <div className="plate blueprint px-6 py-10 md:px-14 md:py-16">
        <span className="absolute inset-y-0 start-0 w-2 bg-accent" aria-hidden />
        <ArrowUpRight className="absolute -bottom-10 -end-6 h-56 w-56 md:h-72 md:w-72 text-panel-foreground/[0.06] rtl:-scale-x-100" strokeWidth={1.2} aria-hidden />
        <div className="relative flex items-center gap-3 mb-6">
          {n && <span className="picto h-8 w-8 bg-accent text-accent-foreground text-sm">{n}</span>}
          <span className="eyebrow !text-panel-muted">{eyebrow}</span>
        </div>
        <h1 className="relative sign-caps text-[clamp(2.2rem,6.5vw,5rem)] max-w-4xl">{title}</h1>
        {intro && <p className="relative mt-6 max-w-xl text-panel-muted">{intro}</p>}
      </div>
    </div>
  );
}

export function StatusStamp({ status, className }: { status: Status; className?: string }) {
  const { t } = useTranslation();
  if (status === "repaired") return <span className={cn("stamp text-success", className)}>{t("stamp.repaired")}</span>;
  if (status === "unrepairable") return <span className={cn("stamp text-destructive", className)}>{t("stamp.reformed")}</span>;
  if (status === "refused") return <span className={cn("stamp text-muted-foreground", className)}>{t("stamp.refused")}</span>;
  return null;
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-panel text-panel-foreground blueprint">
      <div className="flex flex-col items-center gap-6">
        <Emblem className="h-28 w-28 animate-pulse" ring={false} />
        <p className="sign-caps text-sm tracking-[0.2em]">IT Desk</p>
        <div className="h-1 w-40 rounded-full bg-panel-foreground/15 overflow-hidden"><div className="h-full w-1/3 rounded-full bg-accent animate-[slide_1.1s_ease-in-out_infinite_alternate]" /></div>
      </div>
    </div>
  );
}
