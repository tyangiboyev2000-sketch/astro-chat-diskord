DROP POLICY IF EXISTS messages_update_reactions ON public.messages;

CREATE OR REPLACE FUNCTION public.enforce_message_update_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM OLD.user_id THEN
    -- Non-owners may only change the reactions column
    NEW.id := OLD.id;
    NEW.channel_id := OLD.channel_id;
    NEW.user_id := OLD.user_id;
    NEW.author := OLD.author;
    NEW.initials := OLD.initials;
    NEW.body := OLD.body;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_message_update_scope ON public.messages;
CREATE TRIGGER enforce_message_update_scope
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_message_update_scope();

CREATE POLICY messages_update_own ON public.messages
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY messages_update_reactions_only ON public.messages
FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);