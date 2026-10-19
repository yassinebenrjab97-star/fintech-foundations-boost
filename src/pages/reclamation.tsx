import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Copy, AlertTriangle, ChevronDown, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/site";
import { EQUIPMENT, EQ_ICON, SYMPTOMS, type Equipment } from "@/lib/domain";
import { cn } from "@/lib/utils";

const schema = z.object({
  service: z.string().trim().min(1, "required"),
  equipment: z.enum(EQUIPMENT, { errorMap: () => ({ message: "required" }) }),
  brand: z.string().trim().min(1, "required").max(100),
  serial: z.string().trim().max(100).optional(),
  description: z.string().trim().min(3, "required").max(3000),
  urgency: z.enum(["normal", "urgent", "critical"]),
  reporter_name: z.string().trim().min(2, "required").max(150),
  reporter_role: z.string().trim().max(100).optional(),
  phone: z.string().trim().min(1, "required").regex(/^[+\d][\d\s().-]{2,24}$/, "phone"),
  email: z.union([z.literal(""), z.string().trim().email("email").max(255)]).optional(),
  location: z.string().trim().min(2, "required").max(300),
  availability: z.string().trim().max(300).optional(),
});
type Form = z.infer<typeof schema>;

function ServicePicker({ value, onChange, options, error }: { value: string; onChange: (v: string) => void; options: string[]; error?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button type="button" id="service" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} aria-invalid={!!error}
        className={cn("field flex items-center justify-between text-start", !value && "text-muted-foreground", error && "border-destructive")}>
        {value || t("form.servicePh")} <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-[10px] overflow-hidden bg-paper border border-foreground/20 shadow-xl">
          <input autoFocus className="field rounded-none border-0 border-b" placeholder={t("common.search")} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); if (e.key === "Enter" && list[0]) { e.preventDefault(); onChange(list[0]); setOpen(false); } }} />
          <ul role="listbox" className="max-h-64 overflow-auto py-1">
            {list.map((o) => (
              <li key={o}>
                <button type="button" role="option" aria-selected={o === value} onClick={() => { onChange(o); setOpen(false); setQ(""); }}
                  className={cn("w-full text-start px-3 py-2 text-sm hover:bg-secondary/10 flex justify-between", o === value && "font-semibold")}>
                  {o} {o === value && <Check className="h-4 w-4 text-secondary" />}
                </button>
              </li>
            ))}
            {!list.length && <li className="px-3 py-2 text-sm text-muted-foreground">{t("common.noResult")}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid md:grid-cols-[220px_1fr] gap-6 py-12 border-b border-foreground/10">
      <legend className="contents">
        <span className="flex md:flex-col gap-4 items-center md:items-start md:sticky md:top-36 self-start">
          <span className="picto h-11 w-11 bg-panel text-panel-foreground text-base">{n}</span>
          <span className="font-wide font-extrabold uppercase text-lg leading-tight">{title}</span>
        </span>
      </legend>
      <div className="space-y-6">{children}</div>
    </fieldset>
  );
}

export function TicketCard({ ticket }: { ticket: string }) {
  const { t } = useTranslation();
  const copy = async () => { await navigator.clipboard.writeText(ticket); toast.success(t("common.copied")); };
  return (
    <div className="ticket max-w-md mx-auto" style={{ ["--perf" as string]: "62%" }}>
      <div className="p-8 pb-6 text-center">
        <p className="eyebrow">{t("common.dept")} · {t("common.hospital")}</p>
        <p className="mt-6 eyebrow">{t("done.ticket")}</p>
        <p className="mt-2 font-mono text-3xl md:text-4xl font-bold tracking-wider">{ticket}</p>
        <p className="mt-3 text-xs text-muted-foreground font-mono">{new Date().toLocaleString()}</p>
      </div>
      <div className="perforation mx-6" />
      <div className="p-6 text-center space-y-4">
        <button onClick={copy} className="btn-accent w-full"><Copy className="h-4 w-4" /> {t("common.copy")}</button>
        <p className="text-sm text-muted-foreground">{t("done.keep")}</p>
      </div>
    </div>
  );
}

export default function Reclamation() {
  const { t } = useTranslation();
  const [f, setF] = useState<Partial<Form>>({ urgency: "normal" });
  const [otherBrand, setOtherBrand] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("name").order("sort").order("name")).data?.map((s) => s.name) ?? [],
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await supabase.from("brands").select("equipment,name").order("sort")).data ?? [],
  });
  const eqBrands = useMemo(() => brands.filter((b) => b.equipment === f.equipment).map((b) => b.name), [brands, f.equipment]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive" role="alert">{t(`err.${errors[k]}`)}</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...f, brand: f.brand === "__other" ? otherBrand : f.brand };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { const k = String(i.path[0]); map[k === "brand" && f.brand === "__other" ? "otherBrand" : k] ||= i.message === "required" || i.message === "phone" || i.message === "email" ? i.message : "required"; });
      setErrors(map);
      document.getElementById(Object.keys(map)[0])?.focus();
      return;
    }
    if (photo && photo.size > 8 * 1024 * 1024) { setErrors({ photo: "photo" }); return; }
    setSending(true);
    try {
      let photo_path: string | undefined;
      if (photo) {
        const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        photo_path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("request-photos").upload(photo_path, photo, { contentType: photo.type });
        if (error) photo_path = undefined;
      }
      const { data, error } = await supabase.rpc("submit_request", { payload: { ...parsed.data, photo_path } });
      if (error) throw error;
      setTicket(data as string);
      window.scrollTo({ top: 0 });
    } catch {
      toast.error(t("err.generic"));
    } finally {
      setSending(false);
    }
  };

  if (ticket) {
    return (
      <div className="container py-16 md:py-24">
        <p className="eyebrow text-center mb-3">{t("done.title")}</p>
        <h1 className="text-center sign-caps text-4xl md:text-6xl mb-10">{t("done.title")}</h1>
        <TicketCard ticket={ticket} />
        <div className="max-w-md mx-auto mt-8 flex gap-3 items-start p-4 rounded-[10px] border-s-4 border-warning bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm font-medium">{t("done.wait")}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to={`/suivi?ticket=${ticket}`} className="btn-primary">{t("done.track")}</Link>
          <button className="btn-ghost" onClick={() => { setTicket(null); setF({ urgency: "normal" }); setPhoto(null); setOtherBrand(""); }}>{t("done.new")}</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle n={2} eyebrow={t("nav.complaint")} title={t("form.title")} intro={t("form.intro")} />
      <form onSubmit={submit} noValidate className="container">
        <Section n={1} title={t("form.sec1")}>
          <div>
            <label className="label" htmlFor="service">{t("form.service")} *</label>
            <ServicePicker value={f.service ?? ""} onChange={(v) => set("service", v)} options={services} error={errors.service} />
            {err("service")}
          </div>
        </Section>

        <Section n={2} title={t("form.sec2")}>
          <div>
            <span className="label" id="eq-label">{t("form.equipment")} *</span>
            <div role="radiogroup" aria-labelledby="eq-label" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {EQUIPMENT.map((eq) => {
                const Icon = EQ_ICON[eq]; const on = f.equipment === eq;
                return (
                  <button key={eq} type="button" role="radio" aria-checked={on} id={eq === "printer" ? "equipment" : undefined}
                    onClick={() => { set("equipment", eq as Equipment); set("brand", ""); }}
                    className={cn("relative flex flex-col items-start gap-8 p-5 text-start rounded-lg border transition-colors", on ? "bg-panel text-panel-foreground border-panel" : "bg-paper border-foreground/15 hover:border-secondary")}>
                    <Icon className="h-7 w-7" strokeWidth={1.4} />
                    <span className="font-wide font-bold uppercase text-sm leading-tight">{t(`eq.${eq}`)}</span>
                    {on && <Check className="absolute top-3 end-3 h-4 w-4 text-accent" />}
                  </button>
                );
              })}
            </div>
            {err("equipment")}
          </div>
          {f.equipment && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="brand">{t("form.brand")} *</label>
                <select id="brand" className={cn("field", errors.brand && "border-destructive")} value={f.brand ?? ""} onChange={(e) => set("brand", e.target.value)}>
                  <option value="" disabled>—</option>
                  {eqBrands.map((b) => <option key={b}>{b}</option>)}
                  <option value="__other">{t("form.other")}</option>
                </select>
                {err("brand")}
              </div>
              {f.brand === "__other" && (
                <div>
                  <label className="label" htmlFor="otherBrand">{t("form.otherBrand")} *</label>
                  <input id="otherBrand" className="field" value={otherBrand} onChange={(e) => { setOtherBrand(e.target.value); setErrors((x) => ({ ...x, otherBrand: "" })); }} />
                  {err("otherBrand")}
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="label" htmlFor="serial">{t("form.serial")} <span className="normal-case font-normal text-muted-foreground">({t("common.optional")})</span></label>
                <input id="serial" className="field font-mono" value={f.serial ?? ""} onChange={(e) => set("serial", e.target.value)} />
              </div>
            </div>
          )}
        </Section>

        <Section n={3} title={t("form.sec3")}>
          {f.equipment && (
            <div>
              <span className="label">{t("form.symptoms")}</span>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS[f.equipment].map((s) => {
                  const txt = t(`sym.${s}`);
                  return (
                    <button key={s} type="button" className="rounded-full px-3.5 py-1.5 text-sm bg-paper border border-foreground/20 hover:border-secondary hover:text-secondary"
                      onClick={() => set("description", f.description?.includes(txt) ? f.description : [f.description, txt].filter(Boolean).join(" — "))}>
                      + {txt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <label className="label" htmlFor="description">{t("form.description")} *</label>
            <textarea id="description" rows={4} className={cn("field resize-y", errors.description && "border-destructive")} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            {err("description")}
          </div>
          <div>
            <span className="label" id="urg">{t("form.urgency")} *</span>
            <div role="radiogroup" aria-labelledby="urg" className="inline-flex rounded-[10px] overflow-hidden border border-foreground/20 bg-paper">
              {(["normal", "urgent", "critical"] as const).map((u) => (
                <button key={u} type="button" role="radio" aria-checked={f.urgency === u} onClick={() => set("urgency", u)}
                  className={cn("px-4 py-2 text-sm font-semibold border-e last:border-e-0 border-foreground/25",
                    f.urgency === u && (u === "critical" ? "bg-destructive text-destructive-foreground" : u === "urgent" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"))}>
                  {t(`form.${u}`)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("form.criticalHint")}</p>
          </div>
          <div>
            <span className="label">{t("form.photo")} <span className="normal-case font-normal text-muted-foreground">({t("common.optional")})</span></span>
            <label className="flex items-center gap-3 p-5 rounded-[10px] bg-paper border-2 border-dashed border-foreground/20 cursor-pointer hover:border-secondary">
              <Upload className="h-5 w-5 text-secondary" />
              <span className="text-sm">{photo ? photo.name : t("form.photoHint")}</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => { setPhoto(e.target.files?.[0] ?? null); setErrors((x) => ({ ...x, photo: "" })); }} />
            </label>
            {err("photo")}
          </div>
        </Section>

        <Section n={4} title={t("form.sec4")}>
          <div className="grid sm:grid-cols-2 gap-5">
            {([
              ["reporter_name", "name", true, "text"],
              ["reporter_role", "role", false, "text"],
              ["phone", "phone", true, "tel"],
              ["email", "email", false, "email"],
              ["location", "location", true, "text"],
              ["availability", "availability", false, "text"],
            ] as const).map(([k, label, req, type]) => (
              <div key={k}>
                <label className="label" htmlFor={k}>{t(`form.${label}`)} {req ? "*" : <span className="normal-case font-normal text-muted-foreground">({t("common.optional")})</span>}</label>
                <input id={k} type={type} className={cn("field", errors[k] && "border-destructive")} placeholder={k === "reporter_role" ? t("form.rolePh") : undefined}
                  value={(f[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)} autoComplete={k === "phone" ? "tel" : k === "email" ? "email" : k === "reporter_name" ? "name" : undefined} />
                {err(k)}
              </div>
            ))}
          </div>
        </Section>

        <div className="py-10 flex justify-end">
          <button type="submit" disabled={sending} className="btn-primary text-base px-8 py-4 w-full sm:w-auto">{sending ? t("form.sending") : t("form.submit")}</button>
        </div>
      </form>
    </>
  );
}
