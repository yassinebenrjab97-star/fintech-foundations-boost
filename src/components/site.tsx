import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Languages, Menu, X } from "lucide-react";
import logo from "@/assets/sahloul-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGES } from "@/i18n/locales";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/domain";
import Assistant from "./assistant";

export const LOGO_URL = logo.url;

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key,value");
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
    },
  });
}

export function LangSwitch() {
  const { i18n, t } = useTranslation();
  return (
    <label className="relative inline-flex items-center gap-1.5 text-xs font-semibold">
      <Languages className="h-4 w-4" aria-hidden />
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

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  return (
    <button onClick={toggle} aria-label={t("common.theme")} className="p-2 hover:bg-foreground/5">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-foreground/15">
      <div className="h-1 bg-accent" />
      <div className="container flex items-center gap-4 py-3">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src={LOGO_URL} alt="" className="h-10 w-10 shrink-0" />
          <span className="leading-tight min-w-0">
            <span className="block font-display font-semibold text-[15px] truncate">{t("common.dept")}</span>
            <span className="block text-[11px] text-muted-foreground truncate">{t("common.hospital")}</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 ms-auto text-sm font-medium" aria-label="Navigation">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end className="link-u py-1">{l.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1 ms-auto lg:ms-4">
          <LangSwitch />
          <ThemeToggle />
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label={t("nav.menu")} aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden container pb-4 flex flex-col border-t border-foreground/10" onClick={() => setOpen(false)}>
          {links.map((l, i) => (
            <NavLink key={l.to} to={l.to} end className="flex items-baseline gap-4 py-3 border-b border-foreground/10 font-display text-xl">
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>{l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  const { data: s } = useSettings();
  return (
    <footer className="mt-24 border-t border-foreground/20">
      <div className="container py-10 grid gap-6 md:grid-cols-[1fr_auto] items-end">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="" className="h-12 w-12 opacity-90" />
          <div>
            <p className="font-display text-lg">{t("footer.rights")}</p>
            <p className="text-sm text-muted-foreground">{t("common.city")}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground md:text-end space-y-0.5 font-mono">
          {s?.phone && <p><a className="link-u" href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a> · {s.extension}</p>}
          {s?.email && <p><a className="link-u" href={`mailto:${s.email}`}>{s.email}</a></p>}
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

export function PageTitle({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="container pt-12 md:pt-20 pb-8 md:pb-12 border-b border-foreground/15">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h1 className="text-4xl md:text-6xl font-semibold leading-[1.02] max-w-3xl">{title}</h1>
      {intro && <p className="mt-5 max-w-xl text-muted-foreground">{intro}</p>}
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
    <div className="fixed inset-0 grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <img src={LOGO_URL} alt="Hôpital Sahloul" className="h-24 w-24 animate-pulse" />
        <div className="h-px w-32 bg-foreground/20 overflow-hidden"><div className="h-px w-1/3 bg-secondary animate-[fade-up_1s_ease-in-out_infinite_alternate]" /></div>
      </div>
    </div>
  );
}
