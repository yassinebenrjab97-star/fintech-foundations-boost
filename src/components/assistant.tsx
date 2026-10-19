import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { MessageCircle, Send, X, ArrowRight } from "lucide-react";
import { Emblem } from "./site";

type Msg = { role: "user" | "assistant"; content: string };
const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`;

export default function Assistant() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, busy]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ messages: next, lang: i18n.language }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader(); const dec = new TextDecoder();
      let acc = "";
      setMsgs((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]);
      }
      if (!acc) setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: t("ai.err") }]);
    } catch {
      setMsgs((m) => [...m.filter((x) => x.content), { role: "assistant", content: t("ai.err") }]);
    } finally { setBusy(false); }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={t("ai.open")}
          className="group fixed bottom-5 end-5 z-50 flex items-center gap-3 rounded-full bg-panel text-panel-foreground p-1.5 sm:pe-5 shadow-xl ring-1 ring-panel-foreground/10 hover:-translate-y-0.5 transition-transform">
          <span className="relative grid place-items-center h-10 w-10 rounded-full bg-accent text-accent-foreground"><MessageCircle className="h-5 w-5" /><span className="absolute top-0 end-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-panel" /></span><span className="text-sm font-semibold hidden sm:inline">{t("ai.name")}</span>
        </button>
      )}
      {open && (
        <section role="dialog" aria-label={t("ai.name")}
          className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-5 sm:end-5 sm:w-[400px] h-[85vh] sm:h-[600px] flex flex-col overflow-hidden rounded-t-[18px] sm:rounded-[18px] bg-paper border border-foreground/15 shadow-2xl animate-fade-up">
          <header className="flex items-center gap-3 px-4 py-3 bg-panel text-panel-foreground border-b-4 border-accent">
            <Emblem className="h-10 w-10" ring={false} />
            <div className="flex-1 min-w-0">
              <p className="font-wide font-bold uppercase text-sm leading-tight">{t("ai.name")}</p>
              <p className="eyebrow !text-panel-muted">{t("ai.role")}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t("ai.close")} className="p-2 rounded-md hover:bg-panel-foreground/10"><X className="h-4 w-4" /></button>
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm" aria-live="polite">
            <p className="text-muted-foreground">{t("ai.hello")}</p>
            {!msgs.length && (
              <div className="flex flex-wrap gap-2">
                {["c1", "c2", "c3", "c4"].map((c) => (
                  <button key={c} onClick={() => send(t(`ai.${c}`))} className="rounded-full px-3 py-1.5 text-xs border border-foreground/20 hover:border-secondary hover:text-secondary text-start">{t(`ai.${c}`)}</button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => m.role === "user" ? (
              <div key={i} className="ms-auto max-w-[85%] rounded-2xl rounded-ee-sm bg-panel text-panel-foreground px-3.5 py-2 whitespace-pre-wrap">{m.content}</div>
            ) : (
              <div key={i} className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1.5 prose-ol:my-1.5 prose-ul:my-1.5 text-foreground">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ))}
            {busy && msgs[msgs.length - 1]?.role === "user" && <p className="text-muted-foreground animate-pulse">…</p>}
            {msgs.some((m) => m.role === "assistant" && m.content) && !busy && (
              <Link to="/reclamation" onClick={() => setOpen(false)} className="btn-accent btn-sm">{t("ai.declare")} <ArrowRight className="h-3 w-3 rtl:rotate-180" /></Link>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 p-3 border-t border-foreground/15">
            <textarea ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("ai.ph")} aria-label={t("ai.ph")}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              className="field resize-none max-h-32" />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t("ai.send")} className="btn-primary px-3 py-2.5 shrink-0"><Send className="h-4 w-4 rtl:-scale-x-100" /></button>
          </form>
        </section>
      )}
    </>
  );
}
