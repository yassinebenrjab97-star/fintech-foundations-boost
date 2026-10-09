import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Phone, Mail, Clock, MapPin, Hash } from "lucide-react";
import { LOGO_URL, useSettings } from "@/components/site";

export default function Home() {
  const { t } = useTranslation();
  const { data: s } = useSettings();
  const steps = [1, 2, 3, 4];

  return (
    <>
      <section className="container pt-12 md:pt-24 pb-16 grid md:grid-cols-[1.4fr_1fr] gap-10 items-end">
        <div>
          <p className="eyebrow mb-6">{t("common.hospital")} — {t("common.city")}</p>
          <h1 className="text-[clamp(3rem,10vw,7.5rem)] font-semibold leading-[0.92]">
            {t("common.dept")}
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg text-muted-foreground">{t("home.lead")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/reclamation" className="btn-primary text-base px-6 py-4">{t("home.declare")} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
            <Link to="/suivi" className="btn-ghost text-base px-6 py-4">{t("home.track")}</Link>
          </div>
        </div>
        <div className="relative hidden md:block justify-self-end">
          <div className="absolute -inset-6 border border-foreground/15 rounded-full" aria-hidden />
          <img src={LOGO_URL} alt="Emblème de l'Hôpital Sahloul Sousse" className="relative h-72 w-72 lg:h-80 lg:w-80" />
        </div>
      </section>

      <section className="border-t border-foreground/20" aria-labelledby="how">
        <div className="container py-14 md:py-20">
          <h2 id="how" className="eyebrow mb-10">{t("home.how")}</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 border-s border-foreground/15">
            {steps.map((n, i) => (
              <li key={n} className="relative px-6 pb-8 border-e border-b sm:border-b-0 border-foreground/15 animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="block font-display text-[5.5rem] leading-none font-light text-secondary/80">{String(n).padStart(2, "0")}</span>
                <h3 className="mt-4 text-2xl font-semibold">{t(`home.s${n}`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-[26ch]">{t(`home.s${n}d`)}</p>
                {n === 2 && <span className="absolute top-3 end-4 h-2 w-2 bg-accent" aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container" aria-labelledby="contact">
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 border-t-2 border-foreground pt-8">
          <h2 id="contact" className="text-3xl font-semibold max-w-[14ch]">{t("home.contact")}</h2>
          <dl className="grid sm:grid-cols-2 gap-x-10">
            {[
              { icon: Phone, k: "phone", v: s?.phone, href: s?.phone && `tel:${s.phone.replace(/\s/g, "")}` },
              { icon: Hash, k: "ext", v: s?.extension },
              { icon: Mail, k: "email", v: s?.email, href: s?.email && `mailto:${s.email}` },
              { icon: Clock, k: "hours", v: s?.hours },
              { icon: MapPin, k: "location", v: s?.location },
            ].filter((r) => r.v).map(({ icon: Icon, k, v, href }) => (
              <div key={k} className="flex gap-3 py-4 border-b border-foreground/15">
                <Icon className="h-4 w-4 mt-1 text-secondary shrink-0" aria-hidden />
                <div>
                  <dt className="eyebrow">{t(`home.${k}`)}</dt>
                  <dd className="mt-1 font-medium">{href ? <a href={href} className="link-u">{v}</a> : v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
