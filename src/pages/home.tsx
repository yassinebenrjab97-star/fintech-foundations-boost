import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Phone, Mail, Clock, MapPin, Hash, FilePlus2, Radar, Archive } from "lucide-react";
import { Emblem, useSettings } from "@/components/site";
import { EQUIPMENT, EQ_ICON } from "@/lib/domain";
import { cn } from "@/lib/utils";

export default function Home() {
  const { t } = useTranslation();
  const { data: s } = useSettings();

  const directory = [
    { to: "/reclamation", icon: FilePlus2, label: t("home.declare"), desc: t("home.s1d"), main: true },
    { to: "/suivi", icon: Radar, label: t("home.track"), desc: t("track.intro") },
    { to: "/materiel-reforme", icon: Archive, label: t("nav.reformed"), desc: t("reformed.intro") },
  ];

  return (
    <>
      {/* Wayfinding board */}
      <section className="container pt-6 md:pt-10">
        <div className="plate blueprint">
          <span className="absolute inset-y-0 start-0 w-2 bg-accent" aria-hidden />
          <div className="relative px-6 pt-8 pb-10 md:px-14 md:pt-12 md:pb-16">
            <div className="flex items-start justify-between gap-6">
              <p className="eyebrow !text-panel-muted max-w-[28ch]">{t("common.hospital")} — {t("common.city")}</p>
              <Emblem className="h-16 w-16 md:h-24 md:w-24 -mt-1" ring={false} />
            </div>
            <h1 className="mt-6 md:mt-2 sign-caps text-[clamp(2.3rem,7vw,6.4rem)] hyphens-auto [overflow-wrap:anywhere]">
              {t("common.dept")}<span className="inline-block ms-2 h-[0.18em] w-[0.18em] bg-accent align-baseline" aria-hidden />
            </h1>
            <p className="mt-8 max-w-xl text-lg text-panel-muted">{t("home.lead")}</p>
          </div>

          <nav className="relative grid md:grid-cols-3 border-t border-panel-foreground/15" aria-label={t("nav.menu")}>
            {directory.map(({ to, icon: Icon, label, desc, main }, i) => (
              <Link key={to} to={to}
                className={cn("group relative flex flex-col gap-5 p-6 md:p-8 border-panel-foreground/15 transition-colors",
                  i > 0 && "border-t md:border-t-0 md:border-s",
                  main ? "bg-accent text-accent-foreground" : "hover:bg-panel-foreground/[0.06]")}>
                <div className="flex items-center justify-between">
                  <span className={cn("picto h-12 w-12", main ? "bg-panel text-panel-foreground" : "bg-secondary text-secondary-foreground")}>
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <span className={cn("font-mono text-xs font-semibold", main ? "text-accent-foreground/70" : "text-panel-muted")}>0{i + 1}</span>
                </div>
                <div>
                  <p className="font-wide font-extrabold uppercase text-xl leading-tight flex items-center gap-3">
                    {label}
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
                  </p>
                  <p className={cn("mt-2 text-sm line-clamp-2", main ? "text-accent-foreground/75" : "text-panel-muted")}>{desc}</p>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Equipment covered */}
      <section className="container pt-20 md:pt-28" aria-labelledby="scope">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 id="scope" className="sign-caps text-3xl md:text-5xl max-w-[16ch]">{t("home.scope")}</h2>
          <span className="eyebrow">04 · IT</span>
        </div>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {EQUIPMENT.map((eq, i) => {
            const Icon = EQ_ICON[eq];
            return (
              <li key={eq} className="group relative rounded-lg bg-paper border border-foreground/10 p-5 md:p-6 transition-colors hover:border-secondary/60 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="flex items-start justify-between">
                  <span className="picto h-14 w-14 bg-panel text-panel-foreground transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">EQ—0{i + 1}</span>
                </div>
                <p className="mt-10 font-wide font-bold uppercase text-base md:text-lg leading-tight">{t(`eq.${eq}`)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Workflow as a transit line */}
      <section className="container pt-20 md:pt-28" aria-labelledby="how">
        <h2 id="how" className="sign-caps text-3xl md:text-5xl mb-12">{t("home.how")}</h2>
        <ol className="grid md:grid-cols-4 gap-y-2">
          {[1, 2, 3, 4].map((n, i) => (
            <li key={n} className="relative ps-20 md:ps-0 md:pe-8 pb-10 md:pb-0">
              {i < 3 && <span className="hidden md:block absolute top-[26px] start-14 end-0 h-1.5 rounded-full bg-secondary" aria-hidden />}
              {i < 3 && <span className="md:hidden absolute start-[25px] top-14 bottom-0 w-1.5 rounded-full bg-secondary" aria-hidden />}
              <span className={cn("absolute md:relative start-0 top-0 grid place-items-center h-14 w-14 rounded-full border-[5px] font-wide font-extrabold text-lg",
                n === 2 ? "bg-accent border-accent text-accent-foreground" : "bg-paper border-secondary text-foreground")}>{n}</span>
              <h3 className="md:mt-6 font-wide font-extrabold uppercase text-lg">{t(`home.s${n}`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-[30ch]">{t(`home.s${n}d`)}</p>
              {n === 4 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold bg-success/12 text-success border border-success/30">{t("status.repaired")}</span>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/30">{t("status.unrepairable")}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Directory card */}
      <section className="container pt-20 md:pt-28" aria-labelledby="contact">
        <div className="rounded-[18px] bg-paper border border-foreground/10 overflow-hidden grid md:grid-cols-[1fr_1.5fr]">
          <div className="bg-muted/60 p-8 md:p-12 flex flex-col justify-between gap-8 border-b md:border-b-0 md:border-e border-foreground/10">
            <h2 id="contact" className="sign-caps text-3xl md:text-4xl max-w-[12ch]">{t("home.contact")}</h2>
            {s?.phone && (
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="btn-primary self-start"><Phone className="h-4 w-4" /> {s.phone}</a>
            )}
          </div>
          <dl className="p-6 md:p-12 divide-y divide-foreground/10">
            {[
              { icon: Phone, k: "phone", v: s?.phone, href: s?.phone && `tel:${s.phone.replace(/\s/g, "")}` },
              { icon: Hash, k: "ext", v: s?.extension },
              { icon: Mail, k: "email", v: s?.email, href: s?.email && `mailto:${s.email}` },
              { icon: Clock, k: "hours", v: s?.hours },
              { icon: MapPin, k: "location", v: s?.location },
            ].filter((r) => r.v).map(({ icon: Icon, k, v, href }) => (
              <div key={k} className="flex items-end py-4">
                <dt className="flex items-center gap-3 shrink-0">
                  <Icon className="h-4 w-4 text-secondary" aria-hidden />
                  <span className="eyebrow">{t(`home.${k}`)}</span>
                </dt>
                <span className="leader" aria-hidden />
                <dd className="font-semibold text-end">{href ? <a href={href} className="link-u">{v}</a> : v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
