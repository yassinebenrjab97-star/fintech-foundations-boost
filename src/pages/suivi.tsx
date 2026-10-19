import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, StatusStamp } from "@/components/site";
import { FLOW, type Status } from "@/lib/domain";
import { cn } from "@/lib/utils";

type Tracked = { ticket: string; service: string; equipment: string; brand: string; status: Status; refusal_reason: string | null; created_at: string; history: { status: Status; note: string | null; created_at: string }[] };

export default function Suivi() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [ticket, setTicket] = useState(params.get("ticket") ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Tracked | null | undefined>(undefined);

  const lookup = async (tk = ticket) => {
    if (!tk.trim()) return;
    setLoading(true);
    const { data } = await supabase.rpc("track_request", { _ticket: tk.trim(), _phone: phone || null });
    setRes((data as Tracked) ?? null);
    setParams({ ticket: tk.trim().toUpperCase() }, { replace: true });
    setLoading(false);
  };
  useEffect(() => { if (params.get("ticket")) lookup(params.get("ticket")!); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const fmt = (d: string) => new Date(d).toLocaleString(i18n.language, { dateStyle: "medium", timeStyle: "short" });

  const steps: { key: Status | "result"; date?: string; note?: string | null }[] = [];
  if (res) {
    const at = (s: Status) => res.history.find((h) => h.status === s);
    const ended = ["refused", "repaired", "unrepairable"].includes(res.status);
    if (res.status === "refused") {
      steps.push({ key: "pending", date: at("pending")?.created_at ?? res.created_at }, { key: "refused", date: at("refused")?.created_at, note: res.refusal_reason });
    } else {
      FLOW.forEach((s) => steps.push({ key: s, date: at(s)?.created_at ?? (s === "pending" ? res.created_at : undefined) }));
      steps.push(ended ? { key: res.status, date: at(res.status)?.created_at } : { key: "result" });
    }
  }
  const currentIdx = steps.reduce((acc, s, i) => (s.date ? i : acc), 0);

  return (
    <>
      <PageTitle n={2} eyebrow={t("nav.track")} title={t("track.title")} intro={t("track.intro")} />
      <div className="container grid lg:grid-cols-[340px_1fr] gap-12 pt-10">
        <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="space-y-4 lg:sticky lg:top-36 self-start rounded-lg bg-paper border border-foreground/10 p-6">
          <div>
            <label className="label" htmlFor="ticket">{t("track.ticket")}</label>
            <input id="ticket" className="field font-mono text-lg uppercase" placeholder="SAH-2026-0001" value={ticket} onChange={(e) => setTicket(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="tphone">{t("track.phone")}</label>
            <input id="tphone" type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading}><Search className="h-4 w-4" /> {t("track.submit")}</button>
        </form>

        <div aria-live="polite">
          {res === null && <p className="p-6 rounded-lg border border-destructive/40 bg-destructive/5 text-destructive">{t("track.notFound")}</p>}
          {res && (
            <article className="animate-fade-up rounded-lg bg-paper border border-foreground/10 p-6 md:p-10">
              <header className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-foreground/20">
                <div>
                  <p className="font-mono text-2xl md:text-3xl font-semibold tracking-wider">{res.ticket}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`eq.${res.equipment}`)} · {res.brand} · {res.service}</p>
                </div>
                <StatusStamp status={res.status} className="text-base" />
              </header>

              {res.status === "pending" && (
                <div className="mt-6 flex gap-3 p-4 rounded-[10px] border-s-4 border-warning bg-warning/10" role="alert">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0" /><p className="font-semibold">{t("track.wait")}</p>
                </div>
              )}
              {res.status === "accepted" && (
                <div className="mt-6 flex gap-3 p-4 rounded-[10px] border-s-4 border-success bg-success/10" role="status">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" /><p className="font-semibold">{t("track.ok")}</p>
                </div>
              )}

              <ol className="mt-10 relative">
                {steps.map((s, i) => {
                  const done = !!s.date; const current = i === currentIdx;
                  return (
                    <li key={s.key} className="relative ps-14 pb-10 last:pb-0">
                      {i < steps.length - 1 && <span className={cn("absolute start-[15px] top-8 bottom-0 w-1.5 rounded-full", done && steps[i + 1].date ? "bg-secondary" : "bg-foreground/10")} aria-hidden />}
                      <span className={cn("absolute start-0 top-0 h-9 w-9 grid place-items-center rounded-full border-4 font-wide text-xs font-extrabold",
                        current ? "bg-accent border-accent text-accent-foreground ring-4 ring-accent/30" : done ? "bg-paper border-secondary text-foreground" : "bg-paper border-foreground/15 text-muted-foreground")}>
                        {i + 1}
                      </span>
                      <p className={cn("pt-1.5 font-wide uppercase text-base leading-snug", current ? "font-extrabold" : done ? "font-bold" : "font-semibold text-muted-foreground")}>
                        {t(`status.${s.key}`)}
                        {current && <span className="ms-2 eyebrow text-secondary">· {t("track.current")}</span>}
                      </p>
                      {s.date && <p className="font-mono text-xs text-muted-foreground mt-1">{fmt(s.date)}</p>}
                      {s.note && <p className="mt-2 text-sm"><span className="font-semibold">{t("track.refused")} : </span>{s.note}</p>}
                    </li>
                  );
                })}
              </ol>
              {res.status === "refused" && <Link to="/reclamation" className="btn-ghost mt-8">{t("done.new")}</Link>}
            </article>
          )}
        </div>
      </div>
    </>
  );
}
