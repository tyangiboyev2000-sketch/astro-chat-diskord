import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Hash,
  Volume2,
  Send,
  Settings,
  Search,
  Users,
  Plus,
  X,
  PhoneOff,
  Trash2,
  Rocket,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LangContext, LANGS, translations, APP_NAME, type Lang } from "@/lib/i18n";
import { SpaceBackground } from "@/components/space-background";
import { AuthScreen } from "@/components/auth-screen";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AstroChat — Multilingual Space Chat (UZ / RU / EN)" },
      {
        name: "description",
        content:
          "AstroChat is a glassmorphic, star-lit team chat with servers, text and voice channels, live messages and instant Uzbek, Russian and English switching.",
      },
      { property: "og:title", content: "AstroChat — Multilingual Space Chat" },
      {
        property: "og:description",
        content:
          "Star-lit three-column chat workspace with live channels, messages and UZ/RU/EN interface translation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: App,
});

type ServerRow = {
  id: string;
  short: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  color: string;
  position: number;
};
type ChannelRow = {
  id: string;
  server_id: string;
  type: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  topic_uz: string;
  topic_ru: string;
  topic_en: string;
  position: number;
};
type MsgRow = {
  id: string;
  channel_id: string;
  user_id: string | null;
  author: string;
  initials: string;
  body: string;
  reactions: Record<string, number> | null;
  created_at: string;
};
type ProfileRow = { id: string; username: string; initials: string };

const REACTIONS = ["👍", "❤️", "😂", "🔥"];
const PALETTE = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-secondary text-secondary-foreground",
];

const nameOf = (r: { name_uz: string; name_ru: string; name_en: string }, l: Lang) =>
  l === "uz" ? r.name_uz : l === "ru" ? r.name_ru : r.name_en;
const topicOf = (r: { topic_uz: string; topic_ru: string; topic_en: string }, l: Lang) =>
  l === "uz" ? r.topic_uz : l === "ru" ? r.topic_ru : r.topic_en;

function App() {
  const [lang, setLang] = useState<Lang>("uz");
  const t = translations[lang];

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <LangContext.Provider value={{ lang, setLang, t }}>
        <div className="relative flex min-h-screen items-center justify-center text-foreground">
          <SpaceBackground />
          <p className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t.loading}
          </p>
        </div>
      </LangContext.Provider>
    );
  }

  if (!user) {
    return (
      <LangContext.Provider value={{ lang, setLang, t }}>
        <AuthScreen />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <Workspace user={user} profile={profile} setProfile={setProfile} lang={lang} setLang={setLang} />
    </LangContext.Provider>
  );
}

function Workspace({
  user,
  profile,
  setProfile,
  lang,
  setLang,
}: {
  user: User;
  profile: ProfileRow | null;
  setProfile: (p: ProfileRow | null) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const t = translations[lang];

  const [servers, setServers] = useState<ServerRow[]>([]);
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [serverId, setServerId] = useState<string | null>(null);
  const [activeByServer, setActiveByServer] = useState<Record<string, string>>({});

  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [compact, setCompact] = useState(false);
  const [voice, setVoice] = useState<string | null>(null);

  const [channelDialog, setChannelDialog] = useState<null | "text" | "voice">(null);
  const [channelDraftName, setChannelDraftName] = useState("");
  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [serverDraftName, setServerDraftName] = useState("");
  const [serverDraftIcon, setServerDraftIcon] = useState("");

  const me = profile ?? {
    id: user.id,
    username: (user.user_metadata?.["username"] as string) ?? user.email?.split("@")[0] ?? "You",
    initials: "ME",
  };

  const loadCore = useCallback(async () => {
    const [{ data: s }, { data: c }, { data: p }] = await Promise.all([
      supabase.from("servers").select("*").order("position").order("created_at"),
      supabase.from("channels").select("*").order("position").order("created_at"),
      supabase.from("profiles").select("id, username, initials"),
    ]);
    setServers((s ?? []) as ServerRow[]);
    setChannels((c ?? []) as ChannelRow[]);
    setProfiles((p ?? []) as ProfileRow[]);
    const mine = (p ?? []).find((x) => x.id === user.id);
    if (mine) setProfile(mine as ProfileRow);
  }, [user.id, setProfile]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  const server = servers.find((s) => s.id === serverId) ?? servers[0] ?? null;
  const serverChannels = useMemo(
    () => channels.filter((c) => c.server_id === server?.id),
    [channels, server?.id],
  );
  const textChannels = serverChannels.filter((c) => c.type === "text");
  const voiceChannels = serverChannels.filter((c) => c.type === "voice");
  const activeId =
    (server ? activeByServer[server.id] : undefined) ?? textChannels[0]?.id ?? null;
  const activeChannel = textChannels.find((c) => c.id === activeId) ?? textChannels[0] ?? null;

  const loadMessages = useCallback(async (channelId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at");
    setMessages((data ?? []) as MsgRow[]);
  }, []);

  useEffect(() => {
    if (activeChannel) void loadMessages(activeChannel.id);
    else setMessages([]);
  }, [activeChannel?.id, loadMessages]);

  // Realtime: messages, channels, servers, profiles
  useEffect(() => {
    const channel = supabase
      .channel("astrochat-db")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        const row = (payload.new ?? payload.old) as MsgRow;
        if (activeChannel && row?.channel_id === activeChannel.id) void loadMessages(activeChannel.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "channels" }, () => void loadCore())
      .on("postgres_changes", { event: "*", schema: "public", table: "servers" }, () => void loadCore())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void loadCore())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeChannel?.id, loadCore, loadMessages]);

  // Realtime presence: who is online
  useEffect(() => {
    const presence = supabase.channel("astrochat-presence", {
      config: { presence: { key: user.id } },
    });
    presence
      .on("presence", { event: "sync" }, () => {
        setOnlineIds(Object.keys(presence.presenceState()));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void presence.track({ at: Date.now() });
      });
    return () => {
      void supabase.removeChannel(presence);
    };
  }, [user.id]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) => m.body.toLowerCase().includes(q) || m.author.toLowerCase().includes(q),
    );
  }, [messages, query]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visible.length, activeChannel?.id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeChannel) return;
    setDraft("");
    setQuery("");
    await supabase.from("messages").insert({
      channel_id: activeChannel.id,
      user_id: user.id,
      author: me.username,
      initials: me.initials,
      body: text,
    });
    void loadMessages(activeChannel.id);
  };

  const setReaction = async (m: MsgRow, emoji: string, dir: 1 | -1) => {
    const next = { ...(m.reactions ?? {}) };
    const count = (next[emoji] ?? 0) + dir;
    if (count <= 0) delete next[emoji];
    else next[emoji] = count;
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, reactions: next } : x)));
    await supabase.from("messages").update({ reactions: next }).eq("id", m.id);
  };

  const deleteMessage = async (id: string) => {
    setMessages((list) => list.filter((m) => m.id !== id));
    await supabase.from("messages").delete().eq("id", id);
  };

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = channelDraftName.trim();
    if (!name || !channelDialog || !server) return;
    const type = channelDialog;
    setChannelDraftName("");
    setChannelDialog(null);
    const { data } = await supabase
      .from("channels")
      .insert({
        server_id: server.id,
        type,
        name_uz: name,
        name_ru: name,
        name_en: name,
        created_by: user.id,
        position: serverChannels.length,
      })
      .select()
      .single();
    await loadCore();
    if (data && type === "text") {
      setActiveByServer((s) => ({ ...s, [server.id]: (data as ChannelRow).id }));
    }
  };

  const createServer = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = serverDraftName.trim();
    if (!name) return;
    const short = (serverDraftIcon.trim() || name).slice(0, 2).toUpperCase();
    setServerDraftName("");
    setServerDraftIcon("");
    setServerDialogOpen(false);
    const { data: srv } = await supabase
      .from("servers")
      .insert({
        short,
        name_uz: name,
        name_ru: name,
        name_en: name,
        color: PALETTE[servers.length % PALETTE.length]!,
        owner_id: user.id,
        position: servers.length,
      })
      .select()
      .single();
    if (!srv) return;
    const { data: ch } = await supabase
      .from("channels")
      .insert({
        server_id: (srv as ServerRow).id,
        type: "text",
        name_uz: "umumiy",
        name_ru: "общий",
        name_en: "general",
        created_by: user.id,
      })
      .select()
      .single();
    await loadCore();
    setServerId((srv as ServerRow).id);
    if (ch) setActiveByServer((s) => ({ ...s, [(srv as ServerRow).id]: (ch as ChannelRow).id }));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const timeOf = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative flex h-screen w-full gap-2 overflow-hidden p-2 text-foreground">
      <SpaceBackground />

      {/* Server rail */}
      <nav
        aria-label={t.servers}
        className="glass-panel-strong relative z-10 flex w-[68px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-border/50 py-4"
      >
        <span
          title={APP_NAME}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40"
        >
          <Rocket className="h-5 w-5" />
        </span>
        <span className="h-px w-8 bg-border" />
        {servers.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setServerId(s.id);
              setQuery("");
            }}
            title={nameOf(s, lang)}
            aria-current={s.id === server?.id}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all hover:rounded-xl ${s.color} ${
              s.id === server?.id
                ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-transparent"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            {s.short}
          </button>
        ))}
        <button
          onClick={() => setServerDialogOpen(true)}
          aria-label={t.addServer}
          title={t.addServer}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-5 w-5" />
        </button>
      </nav>

      {/* Channel sidebar */}
      <aside className="glass-panel relative z-10 flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 text-sidebar-foreground">
        <div className="flex h-14 flex-col justify-center border-b border-sidebar-border/70 px-4">
          <p className="text-crisp text-base font-semibold leading-tight">{APP_NAME}</p>
          <p className="truncate text-xs text-muted-foreground">
            {server ? nameOf(server, lang) : t.loading}
          </p>
        </div>
        <ScrollArea className="flex-1 px-2 py-4">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.textChannels}
            </p>
            <button
              onClick={() => {
                setChannelDraftName("");
                setChannelDialog("text");
              }}
              aria-label={t.addChannel}
              title={t.addChannel}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-0.5">
            {textChannels.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    if (server) setActiveByServer((s) => ({ ...s, [server.id]: c.id }));
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    activeChannel?.id === c.id
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="truncate">{nameOf(c, lang)}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between px-2 pb-2 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.voiceChannels}
            </p>
            <button
              onClick={() => {
                setChannelDraftName("");
                setChannelDialog("voice");
              }}
              aria-label={t.addChannel}
              title={t.addChannel}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-0.5">
            {voiceChannels.map((c) => {
              const joined = voice === c.id;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setVoice(joined ? null : c.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      joined
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Volume2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{nameOf(c, lang)}</span>
                    <span className="ml-auto text-xs">{joined ? t.leave : t.join}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>

        {voice && (
          <div className="flex items-center gap-2 border-t border-sidebar-border px-3 py-2 text-xs">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
            <span className="truncate text-primary">
              {t.connected} · {voiceChannels.find((v) => v.id === voice)?.name_en ?? ""}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              aria-label={t.leave}
              onClick={() => setVoice(null)}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-sidebar-border p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {me.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{me.username}</p>
            <p className="text-xs text-primary">{t.online}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.settings}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="glass-panel relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-crisp text-base font-semibold">
            {activeChannel ? nameOf(activeChannel, lang) : APP_NAME}
          </h1>
          <span className="hidden truncate border-l border-border pl-3 text-sm text-muted-foreground md:block">
            {activeChannel ? topicOf(activeChannel, lang) : t.tagline}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search}
                className="h-9 w-40 pl-8 pr-8"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label={t.clear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showMembers ? "secondary" : "ghost"}
              size="icon"
              aria-label={t.members}
              onClick={() => setShowMembers((v) => !v)}
            >
              <Users className="h-4 w-4" />
            </Button>
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
                    <span className="ml-auto pl-4 text-xs text-muted-foreground">
                      {l.code.toUpperCase()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <ScrollArea className="flex-1">
            <div className={`mx-auto max-w-3xl px-6 py-6 ${compact ? "space-y-2" : "space-y-5"}`}>
              <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {query ? t.searchResults : t.today}
              </p>
              {visible.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {query ? t.noResults : t.emptyChat}
                </p>
              )}
              {visible.map((m) => (
                <article key={m.id} className="group relative flex gap-3">
                  <span
                    className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      compact ? "h-7 w-7" : "h-10 w-10"
                    } ${
                      m.user_id === user.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {m.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span className="text-crisp text-sm font-semibold">
                        {m.user_id === user.id ? t.you : m.author}
                      </span>
                      <span className="text-xs text-muted-foreground">{timeOf(m.created_at)}</span>
                    </p>
                    <p className="text-crisp whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                      {m.body}
                    </p>
                    {m.reactions && Object.keys(m.reactions).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5" aria-label={t.reactions}>
                        {Object.entries(m.reactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => void setReaction(m, emoji, -1)}
                            className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-xs transition-colors hover:border-primary"
                          >
                            <span>{emoji}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass-panel absolute -top-3 right-0 flex items-center gap-0.5 rounded-lg border border-border/60 p-1 opacity-0 shadow-sm transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => void setReaction(m, emoji, 1)}
                        aria-label={emoji}
                        className="rounded-md px-1.5 py-0.5 text-sm transition-colors hover:bg-secondary"
                      >
                        {emoji}
                      </button>
                    ))}
                    {m.user_id === user.id && (
                      <button
                        onClick={() => void deleteMessage(m.id)}
                        aria-label={t.deleteMessage}
                        title={t.deleteMessage}
                        className="rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {showMembers && (
            <aside className="hidden w-56 shrink-0 border-l border-border p-3 lg:block">
              <p className="pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.members}
              </p>
              <ul className="space-y-2">
                {profiles.map((p) => {
                  const online = onlineIds.includes(p.id);
                  return (
                    <li key={p.id} className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          online
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{p.id === user.id ? t.you : p.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {online ? t.online : t.offline}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-4">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.messagePlaceholder.replace(
              "{channel}",
              activeChannel ? nameOf(activeChannel, lang) : "",
            )}
            className="h-11"
            disabled={!activeChannel}
          />
          <Button type="submit" className="h-11" disabled={!draft.trim() || !activeChannel}>
            <Send className="mr-1 h-4 w-4" />
            {t.send}
          </Button>
        </form>
      </main>

      {/* Settings */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings}</DialogTitle>
            <DialogDescription>
              {APP_NAME} · {me.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block">{t.language}</Label>
              <div className="flex gap-2">
                {LANGS.map((l) => (
                  <Button
                    key={l.code}
                    variant={l.code === lang ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setLang(l.code)}
                  >
                    <span className="mr-1">{l.flag}</span>
                    {l.code.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif">{t.notifications}</Label>
              <Switch id="notif" checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact">{t.compactMode}</Label>
              <Switch id="compact" checked={compact} onCheckedChange={setCompact} />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => void signOut()}>
                <LogOut className="mr-1 h-4 w-4" />
                {t.signOut}
              </Button>
              <Button className="flex-1" onClick={() => setSettingsOpen(false)}>
                {t.close}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create channel */}
      <Dialog open={channelDialog !== null} onOpenChange={(o) => !o && setChannelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createChannel}</DialogTitle>
            <DialogDescription>{server ? nameOf(server, lang) : APP_NAME}</DialogDescription>
          </DialogHeader>
          <form onSubmit={createChannel} className="space-y-5">
            <div>
              <Label className="mb-2 block">{t.channelType}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={channelDialog === "text" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setChannelDialog("text")}
                >
                  <Hash className="mr-1 h-4 w-4" />
                  {t.textType}
                </Button>
                <Button
                  type="button"
                  variant={channelDialog === "voice" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setChannelDialog("voice")}
                >
                  <Volume2 className="mr-1 h-4 w-4" />
                  {t.voiceType}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="chname" className="mb-2 block">
                {t.channelName}
              </Label>
              <Input
                id="chname"
                autoFocus
                value={channelDraftName}
                onChange={(e) => setChannelDraftName(e.target.value)}
                placeholder={t.channelNamePlaceholder}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setChannelDialog(null)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={!channelDraftName.trim()}>
                {t.create}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create server */}
      <Dialog open={serverDialogOpen} onOpenChange={setServerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createServer}</DialogTitle>
            <DialogDescription>{APP_NAME}</DialogDescription>
          </DialogHeader>
          <form onSubmit={createServer} className="space-y-5">
            <div>
              <Label htmlFor="svname" className="mb-2 block">
                {t.serverName}
              </Label>
              <Input
                id="svname"
                autoFocus
                value={serverDraftName}
                onChange={(e) => setServerDraftName(e.target.value)}
                placeholder={t.serverNamePlaceholder}
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="svicon" className="mb-2 block">
                  {t.serverIcon}
                </Label>
                <Input
                  id="svicon"
                  maxLength={2}
                  value={serverDraftIcon}
                  onChange={(e) => setServerDraftIcon(e.target.value)}
                  placeholder={t.serverIconHint}
                />
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-secondary-foreground">
                {(serverDraftIcon.trim() || serverDraftName || "?").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setServerDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={!serverDraftName.trim()}>
                {t.create}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
