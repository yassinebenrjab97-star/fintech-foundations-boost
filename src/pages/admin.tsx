import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Phone, Mail, Trash2, Plus, ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { LOGO_URL, LangSwitch, ThemeToggle, LoadingScreen, StatusStamp } from "@/components/site";
import { EQUIPMENT, NEXT, STATUS_FR, type Status, type Equipment } from "@/lib/domain";
import { cn } from "@/lib/utils";

const EQ_FR: Record<string, string> = { printer: "Imprimante", monitor: "Écran PC", pc: "Unité centrale", qr_printer: "Imprimante QR" };
const fmt = (d: string) => new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = mode === "in" ? await signIn(email, pw) : await signUp(email, pw);
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "up") toast.success("Compte créé. Confirmez votre e-mail, puis demandez l'attribution du rôle administrateur.");
  };
  return (
    <div className="min-h-screen grid place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-sm bg-paper border border-foreground/20 p-8 cut space-y-5">
        <img src={LOGO_URL} alt="" className="h-14 w-14" />
        <div><p className="eyebrow">Service Informatique</p><h1 className="text-3xl font-semibold mt-1">Administration</h1></div>
        <div><label className="label" htmlFor="em">E-mail</label><input id="em" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
        <div><label className="label" htmlFor="pw">Mot de passe</label><input id="pw" type="password" required minLength={8} className="field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} /></div>
        <button className="btn-primary w-full" disabled={busy}>{mode === "in" ? "Se connecter" : "Créer le compte"}</button>
        <button type="button" className="text-xs text-muted-foreground link-u" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </form>
    </div>
  );
}

/* ---------- Requests ---------- */
type Req = { id: string; ticket: string; service: string; equipment: Equipment; brand: string; serial: string | null; description: string; urgency: string; photo_path: string | null; reporter_name: string; reporter_role: string | null; phone: string; email: string | null; location: string; availability: string | null; status: Status; refusal_reason: string | null; internal_notes: string | null; created_at: string };

function useRequests() {
  return useQuery({ queryKey: ["admin-requests"], queryFn: async () => ((await supabase.from("requests").select("*").order("created_at", { ascending: false })).data ?? []) as Req[] });
}

function StatusPill({ s }: { s: Status }) {
  const tone = s === "pending" ? "bg-warning/15 text-warning" : s === "refused" ? "bg-muted text-muted-foreground" : s === "repaired" ? "bg-success/15 text-success" : s === "unrepairable" ? "bg-destructive/15 text-destructive" : "bg-secondary/15 text-secondary";
  return <span className={cn("inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tone)}>{STATUS_FR[s]}</span>;
}

function RequestList() {
  const { data = [], isLoading } = useRequests();
  const [q, setQ] = useState(""); const [st, setSt] = useState(""); const [svc, setSvc] = useState(""); const [eq, setEq] = useState("");
  const services = useMemo(() => [...new Set(data.map((r) => r.service))].sort(), [data]);
  const rows = data.filter((r) => (!st || r.status === st) && (!svc || r.service === svc) && (!eq || r.equipment === eq) && (!q || r.ticket.toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <h1 className="text-4xl font-semibold mb-6">Demandes</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <input className="field font-mono" placeholder="N° ticket…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field" value={st} onChange={(e) => setSt(e.target.value)}><option value="">Tous les statuts</option>{Object.entries(STATUS_FR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className="field" value={svc} onChange={(e) => setSvc(e.target.value)}><option value="">Tous les services</option>{services.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="field" value={eq} onChange={(e) => setEq(e.target.value)}><option value="">Tous les équipements</option>{EQUIPMENT.map((e) => <option key={e} value={e}>{EQ_FR[e]}</option>)}</select>
      </div>
      {isLoading ? <p>Chargement…</p> : !rows.length ? <p className="py-12 text-center text-muted-foreground border-y border-foreground/15">Aucune demande.</p> : (
        <ul className="border-t-2 border-foreground">
          {rows.map((r) => (
            <li key={r.id}>
              <Link to={`/admin/demande/${r.id}`} className="grid gap-1 sm:grid-cols-[150px_1fr_auto] sm:items-center py-4 px-2 border-b border-foreground/10 hover:bg-muted/50">
                <span className="font-mono font-bold">{r.ticket}</span>
                <span className="text-sm"><span className="font-medium">{EQ_FR[r.equipment]} · {r.brand}</span> <span className="text-muted-foreground">— {r.service} · {fmt(r.created_at)}</span>
                  {r.urgency !== "normal" && <span className={cn("ms-2 text-[11px] font-bold uppercase", r.urgency === "critical" ? "text-destructive" : "text-warning")}>{r.urgency === "critical" ? "Critique" : "Urgente"}</span>}
                </span>
                <StatusPill s={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: r, refetch } = useQuery({ queryKey: ["admin-request", id], queryFn: async () => (await supabase.from("requests").select("*").eq("id", id!).maybeSingle()).data as Req | null });
  const { data: history = [], refetch: refetchH } = useQuery({ queryKey: ["admin-history", id], queryFn: async () => (await supabase.from("request_status_history").select("*").eq("request_id", id!).order("created_at")).data ?? [] });
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [refusing, setRefusing] = useState(false);
  const [edit, setEdit] = useState<Partial<Req> | null>(null);

  useEffect(() => { setNotes(r?.internal_notes ?? ""); if (r?.photo_path) supabase.storage.from("request-photos").createSignedUrl(r.photo_path, 3600).then(({ data }) => setPhoto(data?.signedUrl ?? null)); }, [r]);
  if (!r) return <p>Chargement…</p>;

  const refresh = () => { refetch(); refetchH(); qc.invalidateQueries({ queryKey: ["admin-requests"] }); qc.invalidateQueries({ queryKey: ["reformed"] }); };
  const move = async (status: Status, extra: Partial<Req> = {}) => {
    if (status === "unrepairable" && !confirm("Déclarer non réparable ? L'équipement sera ajouté au matériel réformé.")) return;
    const { error } = await supabase.from("requests").update({ status, ...extra }).eq("id", r.id);
    if (error) toast.error(error.message); else { toast.success(`Statut : ${STATUS_FR[status]}`); setRefusing(false); refresh(); }
  };
  const saveNotes = async () => { const { error } = await supabase.from("requests").update({ internal_notes: notes }).eq("id", r.id); error ? toast.error(error.message) : toast.success("Notes enregistrées"); };
  const saveEdit = async () => {
    if (!edit) return;
    const { service, brand, serial, description, urgency, reporter_name, reporter_role, phone, email, location, availability } = edit;
    const { error } = await supabase.from("requests").update({ service, brand, serial, description, urgency, reporter_name, reporter_role, phone, email, location, availability }).eq("id", r.id);
    if (error) toast.error(error.message); else { toast.success("Demande modifiée"); setEdit(null); refresh(); }
  };
  const del = async () => {
    if (!confirm(`Supprimer définitivement la demande ${r.ticket} ?`)) return;
    const { error } = await supabase.from("requests").delete().eq("id", r.id);
    if (error) toast.error(error.message); else { toast.success("Demande supprimée"); qc.invalidateQueries({ queryKey: ["admin-requests"] }); nav("/admin"); }
  };

  const actions: Record<string, { label: string; to: Status; cls: string }[]> = {
    pending: [{ label: "Accepter", to: "accepted", cls: "btn-primary" }],
    accepted: [{ label: "Marquer « Équipement reçu »", to: "awaiting_repair", cls: "btn-primary" }],
    awaiting_repair: [{ label: "Démarrer la réparation", to: "in_repair", cls: "btn-primary" }],
    in_repair: [{ label: "Réparé", to: "repaired", cls: "btn-primary" }, { label: "Non réparable", to: "unrepairable", cls: "btn bg-destructive text-destructive-foreground" }],
  };
  const fields: [keyof Req, string][] = [["service", "Service"], ["brand", "Marque"], ["serial", "N° de série"], ["reporter_name", "Déclarant"], ["reporter_role", "Fonction"], ["phone", "Téléphone"], ["email", "E-mail"], ["location", "Localisation"], ["availability", "Disponibilité"]];

  return (
    <div>
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm link-u mb-6"><ArrowLeft className="h-4 w-4" /> Demandes</Link>
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-foreground/20">
        <div>
          <p className="font-mono text-3xl font-bold">{r.ticket}</p>
          <p className="text-muted-foreground mt-1">{EQ_FR[r.equipment]} · {r.brand} · {r.service} · {fmt(r.created_at)}</p>
        </div>
        <div className="flex items-center gap-3"><StatusPill s={r.status} /><StatusStamp status={r.status} /></div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10 pt-8">
        <div className="space-y-8">
          <section className="p-5 border-s-4 border-accent bg-accent/10">
            <p className="eyebrow mb-3">Prochaine étape</p>
            {NEXT[r.status].length === 0 ? <p className="text-sm">Demande clôturée.</p> : (
              <div className="flex flex-wrap gap-2">
                {actions[r.status]?.map((a) => <button key={a.to} onClick={() => move(a.to)} className={a.cls}>{a.label}</button>)}
                {r.status === "pending" && !refusing && <button onClick={() => setRefusing(true)} className="btn-ghost">Refuser</button>}
              </div>
            )}
            {refusing && (
              <div className="mt-4 space-y-2">
                <label className="label" htmlFor="reason">Motif du refus *</label>
                <textarea id="reason" className="field" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex gap-2">
                  <button className="btn bg-destructive text-destructive-foreground" disabled={!reason.trim()} onClick={() => move("refused", { refusal_reason: reason.trim() })}>Confirmer le refus</button>
                  <button className="btn-ghost" onClick={() => setRefusing(false)}>Annuler</button>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3"><h2 className="text-2xl font-semibold">Informations</h2>
              {!edit ? <button className="btn-ghost btn-sm" onClick={() => setEdit(r)}>Modifier</button> : <div className="flex gap-2"><button className="btn-primary btn-sm" onClick={saveEdit}><Save className="h-3 w-3" /> Enregistrer</button><button className="btn-ghost btn-sm" onClick={() => setEdit(null)}>Annuler</button></div>}
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-8 border-t border-foreground/15">
              {fields.map(([k, label]) => (
                <div key={k} className="py-3 border-b border-foreground/10">
                  <dt className="eyebrow">{label}</dt>
                  {edit ? <input className="field mt-1" value={(edit[k] as string) ?? ""} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /> : (
                    <dd className="mt-1">
                      {k === "phone" ? <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 font-semibold text-secondary link-u"><Phone className="h-3.5 w-3.5" />{r.phone}</a>
                        : k === "email" && r.email ? <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 text-secondary link-u"><Mail className="h-3.5 w-3.5" />{r.email}</a>
                        : (r[k] as string) || "—"}
                    </dd>
                  )}
                </div>
              ))}
              <div className="py-3 border-b border-foreground/10">
                <dt className="eyebrow">Urgence</dt>
                {edit ? <select className="field mt-1" value={edit.urgency} onChange={(e) => setEdit({ ...edit, urgency: e.target.value })}><option value="normal">Normale</option><option value="urgent">Urgente</option><option value="critical">Critique</option></select>
                  : <dd className="mt-1">{{ normal: "Normale", urgent: "Urgente", critical: "Critique" }[r.urgency]}</dd>}
              </div>
              <div className="py-3 sm:col-span-2">
                <dt className="eyebrow">Description</dt>
                {edit ? <textarea className="field mt-1" rows={3} value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /> : <dd className="mt-1 whitespace-pre-wrap">{r.description}</dd>}
              </div>
            </dl>
            {r.refusal_reason && <p className="mt-3 text-sm"><b>Motif du refus :</b> {r.refusal_reason}</p>}
          </section>

          {photo && <section><h2 className="text-2xl font-semibold mb-3">Photo</h2><a href={photo} target="_blank" rel="noreferrer"><img src={photo} alt="Photo de la panne" className="max-h-96 border border-foreground/20" /></a></section>}

          <section>
            <h2 className="text-2xl font-semibold mb-3">Notes internes</h2>
            <textarea className="field" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visibles uniquement par le service informatique" />
            <button className="btn-ghost btn-sm mt-2" onClick={saveNotes}><Save className="h-3 w-3" /> Enregistrer les notes</button>
          </section>
        </div>

        <aside>
          <h2 className="eyebrow mb-4">Historique</h2>
          <ol className="border-s border-foreground/20 ms-1.5 space-y-5">
            {history.map((h) => (
              <li key={h.id} className="relative ps-5">
                <span className="absolute -start-[5px] top-1.5 h-2.5 w-2.5 bg-secondary" />
                <p className="font-medium text-sm">{STATUS_FR[h.status as Status]}</p>
                <p className="font-mono text-xs text-muted-foreground">{fmt(h.created_at)}</p>
                {h.note && <p className="text-xs mt-1">{h.note}</p>}
              </li>
            ))}
          </ol>
          <button onClick={del} className="btn-ghost btn-sm mt-10 text-destructive border-destructive/40"><Trash2 className="h-3 w-3" /> Supprimer la demande</button>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Réformé ---------- */
type Ref = { id: string; ticket: string | null; equipment: string; brand: string | null; serial: string | null; service: string; fault: string | null; reformed_at: string; remarks: string | null };
function ReformedAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["reformed"], queryFn: async () => ((await supabase.from("reformed_equipment").select("*").order("reformed_at", { ascending: false })).data ?? []) as Ref[] });
  const [edit, setEdit] = useState<Partial<Ref> | null>(null);
  const save = async () => {
    if (!edit?.equipment || !edit?.service) { toast.error("Type et service obligatoires"); return; }
    const row = { ticket: edit.ticket || null, equipment: edit.equipment, brand: edit.brand || null, serial: edit.serial || null, service: edit.service, fault: edit.fault || null, reformed_at: edit.reformed_at || new Date().toISOString().slice(0, 10), remarks: edit.remarks || null };
    const { error } = edit.id ? await supabase.from("reformed_equipment").update(row).eq("id", edit.id) : await supabase.from("reformed_equipment").insert(row);
    if (error) toast.error(error.message); else { toast.success("Enregistré"); setEdit(null); qc.invalidateQueries({ queryKey: ["reformed"] }); }
  };
  const del = async (id: string) => { if (!confirm("Supprimer cette entrée ?")) return; const { error } = await supabase.from("reformed_equipment").delete().eq("id", id); error ? toast.error(error.message) : qc.invalidateQueries({ queryKey: ["reformed"] }); };
  const cols: [keyof Ref, string, string?][] = [["ticket", "N° ticket"], ["brand", "Marque"], ["serial", "N° de série"], ["service", "Service d'origine"], ["fault", "Panne constatée"], ["reformed_at", "Date de réforme", "date"], ["remarks", "Remarques"]];
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-4xl font-semibold">Matériel réformé</h1><button className="btn-primary" onClick={() => setEdit({ equipment: "printer" })}><Plus className="h-4 w-4" /> Ajouter</button></div>
      {edit && (
        <div className="mb-8 p-5 bg-paper border border-foreground/20 cut grid sm:grid-cols-2 gap-4">
          <div><label className="label">Type *</label><select className="field" value={edit.equipment} onChange={(e) => setEdit({ ...edit, equipment: e.target.value })}>{EQUIPMENT.map((e) => <option key={e} value={e}>{EQ_FR[e]}</option>)}</select></div>
          {cols.map(([k, l, type]) => <div key={k}><label className="label">{l}{k === "service" && " *"}</label><input type={type ?? "text"} className="field" value={(edit[k] as string) ?? ""} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></div>)}
          <div className="sm:col-span-2 flex gap-2"><button className="btn-primary" onClick={save}>Enregistrer</button><button className="btn-ghost" onClick={() => setEdit(null)}>Annuler</button></div>
        </div>
      )}
      <ul className="border-t-2 border-foreground">
        {data.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 py-3 px-2 border-b border-foreground/10">
            <span className="font-mono text-sm w-32">{r.ticket ?? "—"}</span>
            <span className="flex-1 min-w-[200px] text-sm"><b>{EQ_FR[r.equipment] ?? r.equipment} · {r.brand}</b> — {r.service}<br /><span className="text-muted-foreground">{r.fault}</span></span>
            <span className="font-mono text-xs">{r.reformed_at}</span>
            <button className="btn-ghost btn-sm" onClick={() => setEdit(r)}>Modifier</button>
            <button className="p-2 text-destructive" aria-label="Supprimer" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
        {!data.length && <li className="py-10 text-center text-muted-foreground">Aucune entrée.</li>}
      </ul>
    </div>
  );
}

/* ---------- Settings ---------- */
function Lists() {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery({ queryKey: ["admin-services"], queryFn: async () => (await supabase.from("services").select("*").order("sort").order("name")).data ?? [] });
  const { data: brands = [] } = useQuery({ queryKey: ["admin-brands"], queryFn: async () => (await supabase.from("brands").select("*").order("sort")).data ?? [] });
  const [svc, setSvc] = useState("");
  const [brand, setBrand] = useState<Record<string, string>>({});
  const inv = () => ["admin-services", "admin-brands", "services", "brands"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const run = async (p: PromiseLike<{ error: { message: string } | null }>) => { const { error } = await p; error ? toast.error(error.message) : inv(); };
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-semibold mb-6">Services</h1>
        <form className="flex gap-2 mb-4" onSubmit={(e) => { e.preventDefault(); if (svc.trim()) run(supabase.from("services").insert({ name: svc.trim(), sort: 999 })).then(() => setSvc("")); }}>
          <input className="field" placeholder="Nouveau service" value={svc} onChange={(e) => setSvc(e.target.value)} /><button className="btn-primary"><Plus className="h-4 w-4" /></button>
        </form>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
          {services.map((s) => (
            <li key={s.id} className="flex items-center gap-2 py-1.5 border-b border-foreground/10">
              <input defaultValue={s.name} className="flex-1 bg-transparent text-sm py-1 focus:outline-none focus:bg-paper" aria-label="Nom du service"
                onBlur={(e) => e.target.value.trim() && e.target.value !== s.name && run(supabase.from("services").update({ name: e.target.value.trim() }).eq("id", s.id))} />
              <button className="p-1 text-destructive" aria-label="Supprimer" onClick={() => confirm(`Supprimer « ${s.name} » ?`) && run(supabase.from("services").delete().eq("id", s.id))}><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-4xl font-semibold mb-6">Marques</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {EQUIPMENT.map((eq) => (
            <div key={eq}>
              <h3 className="eyebrow mb-2">{EQ_FR[eq]}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {brands.filter((b) => b.equipment === eq).map((b) => (
                  <span key={b.id} className="inline-flex items-center gap-1 border border-foreground/25 ps-2 text-sm">{b.name}
                    <button className="p-1 text-destructive" aria-label={`Supprimer ${b.name}`} onClick={() => run(supabase.from("brands").delete().eq("id", b.id))}><Trash2 className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const n = brand[eq]?.trim(); if (n) run(supabase.from("brands").insert({ equipment: eq, name: n, sort: 999 })).then(() => setBrand({ ...brand, [eq]: "" })); }}>
                <input className="field" placeholder="Nouvelle marque" value={brand[eq] ?? ""} onChange={(e) => setBrand({ ...brand, [eq]: e.target.value })} /><button className="btn-ghost"><Plus className="h-4 w-4" /></button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactSettings() {
  const qc = useQueryClient();
  const keys: [string, string][] = [["phone", "Téléphone"], ["extension", "Poste interne"], ["email", "E-mail"], ["hours", "Horaires"], ["location", "Adresse"]];
  const { data } = useQuery({ queryKey: ["settings"], queryFn: async () => Object.fromEntries(((await supabase.from("site_settings").select("key,value")).data ?? []).map((r) => [r.key, r.value])) as Record<string, string> });
  const [v, setV] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setV(data); }, [data]);
  const save = async () => {
    const { error } = await supabase.from("site_settings").upsert(keys.map(([key]) => ({ key, value: v[key] ?? "" })));
    error ? toast.error(error.message) : (toast.success("Coordonnées enregistrées"), qc.invalidateQueries({ queryKey: ["settings"] }));
  };
  return (
    <div className="max-w-lg">
      <h1 className="text-4xl font-semibold mb-2">Coordonnées</h1>
      <p className="text-muted-foreground mb-6">Affichées sur la page d'accueil et dans le pied de page.</p>
      <div className="space-y-4">
        {keys.map(([k, l]) => <div key={k}><label className="label" htmlFor={k}>{l}</label><input id={k} className="field" value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></div>)}
        <button className="btn-primary" onClick={save}><Save className="h-4 w-4" /> Enregistrer</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const { isAdmin, isLoading } = useAdmin();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Login />;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <img src={LOGO_URL} alt="" className="h-14 w-14 mx-auto" />
        <h1 className="text-3xl font-semibold">Accès réservé</h1>
        <p className="text-muted-foreground">Le compte <b>{user.email}</b> n'a pas le rôle administrateur. Demandez au responsable de vous l'attribuer.</p>
        <button className="btn-ghost" onClick={signOut}>Se déconnecter</button>
      </div>
    </div>
  );
  const tabs = [["/admin", "Demandes"], ["/admin/reforme", "Matériel réformé"], ["/admin/listes", "Services & marques"], ["/admin/contact", "Coordonnées"]];
  return (
    <div className="min-h-screen">
      <header className="border-b border-foreground/15 bg-background sticky top-0 z-30">
        <div className="h-1 bg-accent" />
        <div className="container flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <Link to="/admin" className="flex items-center gap-2"><img src={LOGO_URL} alt="" className="h-8 w-8" /><span className="font-display font-semibold">Admin · IT Desk</span></Link>
          <nav className="flex gap-5 text-sm font-medium order-last w-full sm:order-none sm:w-auto overflow-x-auto">
            {tabs.map(([to, l]) => <NavLink key={to} to={to} end={to === "/admin"} className="link-u py-1 whitespace-nowrap">{l}</NavLink>)}
          </nav>
          <div className="ms-auto flex items-center gap-1"><LangSwitch /><ThemeToggle /><button onClick={signOut} className="p-2" aria-label="Se déconnecter"><LogOut className="h-4 w-4" /></button></div>
        </div>
      </header>
      <main className="container py-10 animate-fade-up">
        <Routes>
          <Route index element={<RequestList />} />
          <Route path="demande/:id" element={<RequestDetail />} />
          <Route path="reforme" element={<ReformedAdmin />} />
          <Route path="listes" element={<Lists />} />
          <Route path="contact" element={<ContactSettings />} />
        </Routes>
      </main>
    </div>
  );
}
