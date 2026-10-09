CREATE TYPE public.request_status AS ENUM ('pending','refused','accepted','awaiting_repair','in_repair','repaired','unrepairable');
CREATE TYPE public.equipment_type AS ENUM ('printer','monitor','pc','qr_printer');

CREATE TABLE public.services (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, sort int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.services TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated; GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.brands (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), equipment public.equipment_type NOT NULL, name text NOT NULL, sort int NOT NULL DEFAULT 0, UNIQUE(equipment,name));
GRANT SELECT ON public.brands TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated; GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands public read" ON public.brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "brands admin write" ON public.brands FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.site_settings (key text PRIMARY KEY, value text NOT NULL DEFAULT '');
GRANT SELECT ON public.site_settings TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated; GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.ticket_counters (year int PRIMARY KEY, last int NOT NULL DEFAULT 0);
GRANT ALL ON public.ticket_counters TO service_role;
ALTER TABLE public.ticket_counters ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket text NOT NULL UNIQUE DEFAULT '',
  service text NOT NULL,
  equipment public.equipment_type NOT NULL,
  brand text NOT NULL,
  serial text,
  description text NOT NULL,
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal','urgent','critical')),
  photo_path text,
  reporter_name text NOT NULL,
  reporter_role text,
  phone text NOT NULL,
  email text,
  location text NOT NULL,
  availability text,
  status public.request_status NOT NULL DEFAULT 'pending',
  refusal_reason text,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.requests TO authenticated; GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read" ON public.requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update" ON public.requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete" ON public.requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.request_status_history (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE, status public.request_status NOT NULL, note text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.request_status_history TO authenticated; GRANT ALL ON public.request_status_history TO service_role;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read history" ON public.request_status_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.reformed_equipment (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid REFERENCES public.requests(id) ON DELETE SET NULL, ticket text, equipment text NOT NULL, brand text, serial text, service text NOT NULL, fault text, reformed_at date NOT NULL DEFAULT current_date, remarks text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.reformed_equipment TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.reformed_equipment TO authenticated; GRANT ALL ON public.reformed_equipment TO service_role;
ALTER TABLE public.reformed_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reformed public read" ON public.reformed_equipment FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reformed admin write" ON public.reformed_equipment FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.requests_before_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE y int := extract(year from now())::int; n int;
BEGIN
  INSERT INTO public.ticket_counters(year,last) VALUES (y,1) ON CONFLICT (year) DO UPDATE SET last = ticket_counters.last + 1 RETURNING last INTO n;
  NEW.ticket := 'SAH-' || y || '-' || lpad(n::text, 4, '0');
  NEW.status := 'pending'; NEW.internal_notes := NULL; NEW.refusal_reason := NULL;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_requests_before_insert BEFORE INSERT ON public.requests FOR EACH ROW EXECUTE FUNCTION public.requests_before_insert();

CREATE OR REPLACE FUNCTION public.requests_before_update() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT ((OLD.status='pending' AND NEW.status IN ('accepted','refused'))
         OR (OLD.status='accepted' AND NEW.status='awaiting_repair')
         OR (OLD.status='awaiting_repair' AND NEW.status='in_repair')
         OR (OLD.status='in_repair' AND NEW.status IN ('repaired','unrepairable'))) THEN
      RAISE EXCEPTION 'Transition de statut non autorisée: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_requests_before_update BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.requests_before_update();

CREATE OR REPLACE FUNCTION public.requests_after_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP='INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_history(request_id,status,note) VALUES (NEW.id, NEW.status, CASE WHEN NEW.status='refused' THEN NEW.refusal_reason END);
    IF NEW.status='unrepairable' THEN
      INSERT INTO public.reformed_equipment(request_id,ticket,equipment,brand,serial,service,fault)
      VALUES (NEW.id, NEW.ticket, NEW.equipment::text, NEW.brand, NEW.serial, NEW.service, NEW.description);
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_requests_after_change AFTER INSERT OR UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.requests_after_change();

CREATE OR REPLACE FUNCTION public.submit_request(payload jsonb) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t text;
BEGIN
  IF coalesce(payload->>'reporter_name','')='' OR coalesce(payload->>'phone','')='' OR coalesce(payload->>'location','')='' OR coalesce(payload->>'service','')='' OR coalesce(payload->>'description','')='' THEN
    RAISE EXCEPTION 'missing required fields';
  END IF;
  INSERT INTO public.requests(service,equipment,brand,serial,description,urgency,photo_path,reporter_name,reporter_role,phone,email,location,availability)
  VALUES (left(payload->>'service',200), (payload->>'equipment')::public.equipment_type, left(coalesce(payload->>'brand','Autre'),100), nullif(left(payload->>'serial',100),''), left(payload->>'description',3000), coalesce(payload->>'urgency','normal'), nullif(payload->>'photo_path',''), left(payload->>'reporter_name',150), nullif(left(payload->>'reporter_role',100),''), left(payload->>'phone',40), nullif(left(payload->>'email',255),''), left(payload->>'location',300), nullif(left(payload->>'availability',300),''))
  RETURNING ticket INTO t;
  RETURN t;
END $$;
GRANT EXECUTE ON FUNCTION public.submit_request(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_request(_ticket text, _phone text DEFAULT NULL) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('ticket',r.ticket,'service',r.service,'equipment',r.equipment,'brand',r.brand,'status',r.status,'refusal_reason',r.refusal_reason,'created_at',r.created_at,
    'history',(SELECT coalesce(jsonb_agg(jsonb_build_object('status',h.status,'note',h.note,'created_at',h.created_at) ORDER BY h.created_at),'[]'::jsonb) FROM public.request_status_history h WHERE h.request_id=r.id))
  FROM public.requests r
  WHERE upper(r.ticket)=upper(trim(_ticket))
    AND (_phone IS NULL OR _phone='' OR regexp_replace(r.phone,'\D','','g') LIKE '%' || regexp_replace(_phone,'\D','','g') || '%')
$$;
GRANT EXECUTE ON FUNCTION public.track_request(text,text) TO anon, authenticated;

CREATE POLICY "anyone upload request photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id='request-photos');
CREATE POLICY "admin read request photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='request-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete request photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='request-photos' AND public.has_role(auth.uid(),'admin'));