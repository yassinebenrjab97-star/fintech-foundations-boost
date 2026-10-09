# Sahloul IT Desk — build plan

Replace the current "Revio" template with the Sahloul IT Desk app described in the brief, using the uploaded hospital emblem.

## Design
- Palette from the emblem: deep navy ink, sky blue, signal yellow as the single sharp accent. Warm off-white paper in light mode, deep ink (not black) in dark mode.
- Fonts: Fraunces (display serif) + Instrument Sans (text). Thin 1px rules, oversized step numbers, cut corners, subtle grain.
- Signature details: perforated ticket card, stamp badges (RÉPARÉ, RÉFORMÉ, REFUSÉE), vertical tracking timeline. Calm fade/stagger animations only. Mobile first.
- Emblem in header, favicon and loading screen.

## Phases (in the order the brief asks)
1. **Foundation** — remove template pages, new layout (header with nav, language switcher, theme toggle; footer), i18n with 10 languages incl. Arabic RTL, dark/light persisted.
2. **Home** `/` — editorial title, welcome line, two actions, 4-step "how it works", contact block (editable by admin).
3. **Réclamation** `/reclamation` — full form (searchable service list, 4 equipment tiles, dependent brands + "Autre", symptoms chips, urgency, photo upload, contact block), zod validation, printed-ticket confirmation with SAH-YYYY-0001 number and copy button.
4. **Suivi** `/suivi` — lookup by ticket (+ optional phone), timeline with dates, contextual warning/green notice.
5. **Admin** `/admin` (unlinked) — email/password login, admin role check on the server, request list with filters/search, detail view with click-to-call/email, photo, history, workflow buttons that cannot skip steps, internal notes, management of services, brands, contact info, réformé entries.
6. **Matériel réformé** `/materiel-reforme` — public table (cards on mobile), search and filters; "Non réparable" automatically creates an entry.
7. **Ilhem Eltaif Assistant** — floating chat on public pages, streaming AI replies restricted to IT support for the 4 equipment types and the workflow, answers in the user's language, suggestion chips, button to /reclamation. One conversation, not saved.

## Technical details
- Tables: requests, request_status_history, services, brands, reformed_equipment, user_roles, site_settings, plus a private storage bucket for photos.
- Public can insert requests; ticket lookup goes through a secure database function requiring the exact ticket number (no open reads). Only admins update/delete. Status transitions enforced by a database trigger; "Non réparable" trigger inserts into reformed_equipment.
- Ticket numbers generated in the database (per-year sequence).
- Assistant via a backend function calling Lovable AI with streaming.
- First admin: you sign up at /admin, then I grant the admin role to that account.
