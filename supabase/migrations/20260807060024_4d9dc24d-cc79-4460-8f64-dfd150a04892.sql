-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  initials text NOT NULL DEFAULT '??',
  color text NOT NULL DEFAULT 'bg-primary text-primary-foreground',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_name text;
BEGIN
  raw_name := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(COALESCE(NEW.email, 'user'), '@', 1)
  );
  INSERT INTO public.profiles (id, username, initials)
  VALUES (NEW.id, raw_name, upper(substring(regexp_replace(raw_name, '[^a-zA-Z0-9]', '', 'g') from 1 for 2)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SERVERS
CREATE TABLE public.servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short text NOT NULL,
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  name_en text NOT NULL,
  color text NOT NULL DEFAULT 'bg-primary text-primary-foreground',
  owner_id uuid,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servers TO authenticated;
GRANT ALL ON public.servers TO service_role;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "servers_select" ON public.servers FOR SELECT TO authenticated USING (true);
CREATE POLICY "servers_insert" ON public.servers FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "servers_delete_own" ON public.servers FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- CHANNELS
CREATE TABLE public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'text',
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  name_en text NOT NULL,
  topic_uz text NOT NULL DEFAULT '',
  topic_ru text NOT NULL DEFAULT '',
  topic_en text NOT NULL DEFAULT '',
  created_by uuid,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX channels_server_idx ON public.channels(server_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT ALL ON public.channels TO service_role;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "channels_select" ON public.channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "channels_insert" ON public.channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "channels_delete_own" ON public.channels FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid,
  author text NOT NULL,
  initials text NOT NULL DEFAULT '??',
  body text NOT NULL,
  reactions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_channel_idx ON public.messages(channel_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update_reactions" ON public.messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "messages_delete_own" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- REALTIME
ALTER TABLE public.servers REPLICA IDENTITY FULL;
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.servers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- SEED
INSERT INTO public.servers (id, short, name_uz, name_ru, name_en, color, position) VALUES
  ('11111111-1111-4111-8111-111111111111', 'UZ', 'Jamoa', 'Команда', 'Team', 'bg-primary text-primary-foreground', 0),
  ('22222222-2222-4222-8222-222222222222', 'DV', 'Dasturlash', 'Разработка', 'Dev', 'bg-accent text-accent-foreground', 1),
  ('33333333-3333-4333-8333-333333333333', 'MU', 'Musiqa', 'Музыка', 'Music', 'bg-secondary text-secondary-foreground', 2);

INSERT INTO public.channels (id, server_id, type, name_uz, name_ru, name_en, topic_uz, topic_ru, topic_en, position) VALUES
  ('aaaaaaa1-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'text', 'umumiy', 'общий', 'general', 'Jamoa uchun umumiy suhbat kanali', 'Общий канал для всей команды', 'General channel for the whole team', 0),
  ('aaaaaaa1-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'text', 'elonlar', 'объявления', 'announcements', 'Muhim yangiliklar', 'Важные новости', 'Important updates', 1),
  ('aaaaaaa1-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'text', 'yordam', 'помощь', 'help', 'Savollar va yordam', 'Вопросы и помощь', 'Questions and help', 2),
  ('aaaaaaa1-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'voice', 'Dam olish xonasi', 'Комната отдыха', 'Lounge', '', '', '', 0),
  ('aaaaaaa1-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'voice', 'Musiqa', 'Музыка', 'Music', '', '', '', 1),
  ('bbbbbbb1-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'text', 'frontend', 'фронтенд', 'frontend', 'Interfeys ishlari', 'Работа над интерфейсом', 'Interface work', 0),
  ('bbbbbbb1-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'text', 'backend', 'бэкенд', 'backend', 'Server va API', 'Сервер и API', 'Server and API', 1),
  ('bbbbbbb1-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'text', 'xatolar', 'баги', 'bugs', 'Xatoliklar royxati', 'Список багов', 'Bug tracker', 2),
  ('bbbbbbb1-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'voice', 'Standup', 'Стендап', 'Standup', '', '', '', 0),
  ('bbbbbbb1-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222', 'voice', 'Juftlik kodlash', 'Парное программирование', 'Pairing', '', '', '', 1),
  ('ccccccc1-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'text', 'pleylistlar', 'плейлисты', 'playlists', 'Sevimli pleylistlar', 'Любимые плейлисты', 'Favourite playlists', 0),
  ('ccccccc1-0000-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', 'text', 'yangi-relizlar', 'новинки', 'releases', 'Yangi chiqqan albomlar', 'Новые альбомы', 'New releases', 1),
  ('ccccccc1-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'voice', 'Sahna', 'Сцена', 'Stage', '', '', '', 0),
  ('ccccccc1-0000-4000-8000-000000000004', '33333333-3333-4333-8333-333333333333', 'voice', 'Studiya', 'Студия', 'Studio', '', '', '', 1);

INSERT INTO public.messages (channel_id, author, initials, body, created_at) VALUES
  ('aaaaaaa1-0000-4000-8000-000000000001', 'Aziza', 'AZ', 'Salom hammaga! Bugungi uchrashuv soat 15:00 da.', now() - interval '3 hours'),
  ('aaaaaaa1-0000-4000-8000-000000000001', 'Dmitry', 'DM', 'Спасибо, я готов.', now() - interval '2 hours'),
  ('aaaaaaa1-0000-4000-8000-000000000001', 'Sarah', 'SA', 'I uploaded the new design mockups — please take a look.', now() - interval '1 hour'),
  ('aaaaaaa1-0000-4000-8000-000000000002', 'Aziza', 'AZ', 'Juma kuni ofis yopiq boladi.', now() - interval '5 hours'),
  ('aaaaaaa1-0000-4000-8000-000000000003', 'Dmitry', 'DM', 'Как сбросить пароль для входа?', now() - interval '4 hours'),
  ('bbbbbbb1-0000-4000-8000-000000000001', 'Sarah', 'SA', 'The new component library is ready.', now() - interval '6 hours'),
  ('bbbbbbb1-0000-4000-8000-000000000002', 'Timur', 'TI', 'API response time improved by 40%.', now() - interval '7 hours'),
  ('ccccccc1-0000-4000-8000-000000000001', 'Aziza', 'AZ', 'Ishlash uchun sokin pleylist qoshdim.', now() - interval '8 hours');