DROP POLICY IF EXISTS messages_update_reactions_only ON public.messages;

CREATE OR REPLACE FUNCTION public.set_message_reactions(_message_id uuid, _reactions jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF jsonb_typeof(_reactions) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Invalid reactions payload';
  END IF;
  UPDATE public.messages SET reactions = _reactions WHERE id = _message_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_message_reactions(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_message_reactions(uuid, jsonb) TO authenticated;