import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/site";
import { EQUIPMENT } from "@/lib/domain";

export function useReformed() {
  return useQuery({
    queryKey: ["reformed"],
    queryFn: async () => (await supabase.from("reformed_equipment").select("*").order("reformed_at", { ascending: false })).data ?? [],
  });
}

export default function Reforme() {
  const { t, i18n } = useTranslation();
  const { data = [], isLoading } = useReformed();
  const [q, setQ] = useState("");
  const [svc, setSvc] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");

  const services = useMemo(() => [...new Set(data.map((r) => r.service))].sort(), [data]);
  const brands = useMemo(() => [...new Set(data.map((r) => r.brand).filter(Boolean) as string[])].sort(), [data]);
  const rows = data.filter((r) =>
    (!svc || r.service === svc) && (!type || r.equipment === type) && (!brand || r.brand === brand) &&
    (!q || [r.ticket, r.serial, r.fault, r.remarks, r.service, r.brand].join(" ").toLowerCase().includes(q.toLowerCase())));
  const eqLabel = (e: string) => (EQUIPMENT as readonly string[]).includes(e) ? t(`eq.${e}`) : e;
  const date = (d: string) => new Date(d).toLocaleDateString(i18n.language);

  return (
    <>
      <PageTitle eyebrow={t("nav.reformed")} title={t("reformed.title")} intro={t("reformed.intro")} />
      <div className="container pt-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <input className="field" placeholder={t("common.search")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("common.search")} />
          <select className="field" value={svc} onChange={(e) => setSvc(e.target.value)} aria-label={t("reformed.service")}>
            <option value="">{t("reformed.service")} — {t("common.all")}</option>{services.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="field" value={type} onChange={(e) => setType(e.target.value)} aria-label={t("reformed.type")}>
            <option value="">{t("reformed.type")} — {t("common.all")}</option>{EQUIPMENT.map((e) => <option key={e} value={e}>{t(`eq.${e}`)}</option>)}
          </select>
          <select className="field" value={brand} onChange={(e) => setBrand(e.target.value)} aria-label={t("reformed.brand")}>
            <option value="">{t("reformed.brand")} — {t("common.all")}</option>{brands.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <p className="eyebrow mt-6 mb-3">{t("reformed.count", { count: rows.length })}</p>

        {isLoading ? <p className="text-muted-foreground">{t("common.loading")}</p> : !rows.length ? (
          <p className="py-16 text-center text-muted-foreground border-y border-foreground/15">{t("reformed.empty")}</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto border-t-2 border-foreground">
              <table className="w-full text-sm">
                <thead><tr className="text-start">
                  {["ticket", "type", "brand", "serial", "service", "fault", "date", "remarks"].map((c) => <th key={c} className="eyebrow text-start py-3 px-3 border-b border-foreground/20 font-normal">{t(`reformed.${c}`)}</th>)}
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-foreground/10 hover:bg-muted/50 align-top">
                      <td className="py-3 px-3 font-mono whitespace-nowrap">{r.ticket ?? "—"}</td>
                      <td className="py-3 px-3">{eqLabel(r.equipment)}</td>
                      <td className="py-3 px-3">{r.brand}</td>
                      <td className="py-3 px-3 font-mono">{r.serial ?? "—"}</td>
                      <td className="py-3 px-3">{r.service}</td>
                      <td className="py-3 px-3 max-w-xs">{r.fault}</td>
                      <td className="py-3 px-3 font-mono whitespace-nowrap">{date(r.reformed_at)}</td>
                      <td className="py-3 px-3 text-muted-foreground">{r.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="md:hidden space-y-4">
              {rows.map((r) => (
                <li key={r.id} className="relative bg-paper border border-foreground/20 p-5 cut">
                  <span className="stamp text-destructive absolute top-4 end-4">{t("stamp.reformed")}</span>
                  <p className="font-mono text-sm font-bold">{r.ticket ?? "—"}</p>
                  <p className="font-display text-xl mt-1">{eqLabel(r.equipment)} · {r.brand}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div><dt className="eyebrow">{t("reformed.service")}</dt><dd>{r.service}</dd></div>
                    <div><dt className="eyebrow">{t("reformed.date")}</dt><dd className="font-mono">{date(r.reformed_at)}</dd></div>
                    {r.serial && <div className="col-span-2"><dt className="eyebrow">{t("reformed.serial")}</dt><dd className="font-mono">{r.serial}</dd></div>}
                    <div className="col-span-2"><dt className="eyebrow">{t("reformed.fault")}</dt><dd>{r.fault}</dd></div>
                    {r.remarks && <div className="col-span-2"><dt className="eyebrow">{t("reformed.remarks")}</dt><dd>{r.remarks}</dd></div>}
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
