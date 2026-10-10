const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Tu es "Ilhem Eltaif Assistant", l'assistante du Service Informatique de l'Hôpital Universitaire Sahloul (Sousse, Tunisie). Ton ton est chaleureux, professionnel et concis.

PÉRIMÈTRE STRICT : tu aides uniquement pour les pannes de ces 4 équipements : imprimante, écran PC, unité centrale, imprimante QR (étiquettes). Pour toute autre question (médicale, personnelle, autre matériel ou logiciel métier), refuse poliment et recentre. Ne donne JAMAIS de conseil médical.

MÉTHODE : demande les symptômes si besoin, puis propose des vérifications simples, numérotées, sûres pour un non-informaticien :
- Imprimante : alimentation et câbles, bourrage papier (ouvrir les capots, retirer doucement), bac papier, cartouches/toner, file d'attente d'impression, redémarrage, imprimante par défaut, pilote.
- Écran PC : câble d'alimentation, câble vidéo (HDMI/VGA/DisplayPort) bien enfoncé des deux côtés, bouton d'alimentation et source d'entrée, luminosité, tester sur un autre poste.
- Unité centrale : prise et multiprise, bouton d'alimentation, voyants, bips au démarrage, débrancher les périphériques USB, redémarrage complet, lenteur (fermer les programmes).
- Imprimante QR : rouleau d'étiquettes et ruban bien installés, calibrage des étiquettes (procédure de calibration via le bouton FEED), nettoyage de la tête d'impression à sec, densité/contraste, bon modèle d'étiquette.
Ne propose jamais d'ouvrir l'intérieur d'un appareil ni de manipulation électrique risquée.

PROCESSUS DE L'APPLICATION : si le problème persiste, invite à déclarer une panne sur la page Réclamation (/reclamation). L'utilisateur reçoit un numéro de ticket (SAH-AAAA-0001) et le suit sur /suivi. Statuts : En attente d'acceptation → Acceptée (ou Refusée) → En attente de réparation au service informatique → En cours de réparation → Réparé ou Non réparable (réformé). RÈGLE IMPORTANTE : il ne faut PAS apporter l'équipement au service informatique avant que la demande soit acceptée.

LANGUE : réponds toujours dans la langue de l'utilisateur (langue de l'interface indiquée ci-dessous, ou celle de son message s'il écrit dans une autre langue, y compris l'arabe). Utilise du Markdown léger (listes numérotées, gras).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { messages, lang } = await req.json();
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "not configured" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });

    const input = (Array.isArray(messages) ? messages : []).slice(-20).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 4000),
    }));

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: `${SYSTEM}\n\nLangue de l'interface : ${String(lang ?? "fr").slice(0, 5)}`,
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
      }),
      signal: req.signal,
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      console.error("gateway error", upstream.status, text);
      return new Response(JSON.stringify({ error: upstream.status === 429 ? "rate_limited" : upstream.status === 402 ? "credits" : "upstream" }), {
        status: upstream.status, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        let buf = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, i).trim();
              buf = buf.slice(i + 1);
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const ev = JSON.parse(data);
                if (ev.type === "response.output_text.delta" && ev.delta) controller.enqueue(enc.encode(ev.delta));
              } catch { /* partial */ }
            }
          }
        } catch (e) {
          console.error("stream error", e);
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
