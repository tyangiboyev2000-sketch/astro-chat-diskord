import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SpaceBackground } from "@/components/space-background";
import { LANGS, useLang, APP_NAME } from "@/lib/i18n";

export function AuthScreen() {
  const { lang, setLang, t } = useLang();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) setInfo(t.checkEmail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  // Dev-only mock "Google" sign-in: no external popup, no OAuth redirect.
  // Signs into (or creates) a deterministic demo account.
  const google = async () => {
    setBusy(true);
    setError(null);
    setInfo(null);
    const demoEmail = "demo.google@astro.chat";
    const demoPassword = "astrochat-demo-2024";
    try {
      const first = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      if (first.error) {
        const { error } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: "Demo Astronaut" },
          },
        });
        if (error) throw error;
        const retry = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
        if (retry.error) throw retry.error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-foreground">
      <SpaceBackground />

      <div className="absolute right-4 top-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" aria-label={t.language}>
              <span className="mr-1">{LANGS.find((l) => l.code === lang)?.flag}</span>
              {lang.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGS.map((l) => (
              <DropdownMenuItem key={l.code} onSelect={() => setLang(l.code)}>
                <span className="mr-2">{l.flag}</span>
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <section className="glass-panel-strong crisp-scope relative z-10 w-full max-w-md rounded-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <span className="neon-active flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Rocket className="h-7 w-7" />
          </span>
          <h1 className="logo-glow mt-4 text-2xl font-bold tracking-tight">{t.authWelcome}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.authSubtitle}</p>
        </div>


        <Button
          type="button"
          variant="secondary"
          className="mt-6 h-11 w-full"
          onClick={google}
          disabled={busy}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c5.6 0 9.3-3.9 9.3-9.4 0-.6-.06-1.1-.15-1.6H12z"
            />
          </svg>
          {t.continueWithGoogle}
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t.orContinueWith}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name" className="mb-1.5 block">
                {t.displayName}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.displayNamePlaceholder}
                className="h-11"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="mb-1.5 block">
              {t.email}
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@astro.chat"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block">
              {t.password}
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}

          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? t.signIn : t.signUp}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? t.noAccount : t.haveAccount}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="font-medium text-primary hover:underline"
          >
            {mode === "signin" ? t.signUp : t.signIn}
          </button>
        </p>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {APP_NAME} · {t.tagline}
        </p>
      </section>
    </div>
  );
}
