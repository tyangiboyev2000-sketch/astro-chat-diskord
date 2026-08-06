import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Hash, Volume2, Send, Settings, Search, Users, Plus, X, PhoneOff } from "lucide-react";
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
import { LangContext, LANGS, translations, type Lang } from "@/lib/i18n";
import { SpaceBackground } from "@/components/space-background";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Suhbat — Multilingual Team Chat (UZ / RU / EN)" },
      {
        name: "description",
        content:
          "A clean, readable Discord-style chat app with servers, text and voice channels, and instant Uzbek, Russian and English language switching.",
      },
      { property: "og:title", content: "Suhbat — Multilingual Team Chat" },
      {
        property: "og:description",
        content:
          "Simple three-column chat workspace with channels and UZ/RU/EN interface translation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type L10n = Record<Lang, string>;
type Channel = { key: string; name: L10n; topic: L10n };
type Server = {
  id: string;
  short: string;
  name: L10n;
  color: string;
  text: Channel[];
  voice: Channel[];
};
type Msg = { id: number; author: string; initials: string; time: string; body: L10n };

const tri = (uz: string, ru: string, en: string): L10n => ({ uz, ru, en });

const servers: Server[] = [
  {
    id: "s1",
    short: "UZ",
    name: tri("Jamoa", "Команда", "Team"),
    color: "bg-primary text-primary-foreground",
    text: [
      {
        key: "general",
        name: tri("umumiy", "общий", "general"),
        topic: tri(
          "Jamoa uchun umumiy suhbat kanali",
          "Общий канал для всей команды",
          "General channel for the whole team",
        ),
      },
      {
        key: "announcements",
        name: tri("elonlar", "объявления", "announcements"),
        topic: tri("Muhim yangiliklar", "Важные новости", "Important updates"),
      },
      {
        key: "help",
        name: tri("yordam", "помощь", "help"),
        topic: tri("Savollar va yordam", "Вопросы и помощь", "Questions and help"),
      },
    ],
    voice: [
      { key: "lounge", name: tri("Dam olish xonasi", "Комната отдыха", "Lounge"), topic: tri("", "", "") },
      { key: "music", name: tri("Musiqa", "Музыка", "Music"), topic: tri("", "", "") },
    ],
  },
  {
    id: "s2",
    short: "DV",
    name: tri("Dasturlash", "Разработка", "Dev"),
    color: "bg-accent text-accent-foreground",
    text: [
      {
        key: "frontend",
        name: tri("frontend", "фронтенд", "frontend"),
        topic: tri("Interfeys ishlari", "Работа над интерфейсом", "Interface work"),
      },
      {
        key: "backend",
        name: tri("backend", "бэкенд", "backend"),
        topic: tri("Server va API", "Сервер и API", "Server and API"),
      },
      {
        key: "bugs",
        name: tri("xatolar", "баги", "bugs"),
        topic: tri("Xatoliklar ro'yxati", "Список багов", "Bug tracker"),
      },
    ],
    voice: [
      { key: "standup", name: tri("Standup", "Стендап", "Standup"), topic: tri("", "", "") },
      { key: "pairing", name: tri("Juftlik kodlash", "Парное программирование", "Pairing"), topic: tri("", "", "") },
    ],
  },
  {
    id: "s3",
    short: "MU",
    name: tri("Musiqa", "Музыка", "Music"),
    color: "bg-secondary text-secondary-foreground",
    text: [
      {
        key: "playlists",
        name: tri("pleylistlar", "плейлисты", "playlists"),
        topic: tri("Sevimli pleylistlar", "Любимые плейлисты", "Favourite playlists"),
      },
      {
        key: "releases",
        name: tri("yangi-relizlar", "новинки", "releases"),
        topic: tri("Yangi chiqqan albomlar", "Новые альбомы", "New releases"),
      },
    ],
    voice: [
      { key: "stage", name: tri("Sahna", "Сцена", "Stage"), topic: tri("", "", "") },
      { key: "studio", name: tri("Studiya", "Студия", "Studio"), topic: tri("", "", "") },
    ],
  },
];

const seed: Record<string, Msg[]> = {
  general: [
    { id: 1, author: "Aziza", initials: "AZ", time: "10:12", body: tri("Salom hammaga! Bugungi uchrashuv soat 15:00 da.", "Всем привет! Сегодняшняя встреча в 15:00.", "Hi everyone! Today's meeting is at 15:00.") },
    { id: 2, author: "Dmitry", initials: "DM", time: "10:15", body: tri("Rahmat, men tayyorman.", "Спасибо, я готов.", "Thanks, I'm ready.") },
    { id: 3, author: "Sarah", initials: "SA", time: "10:21", body: tri("Yangi dizayn maketlarini yukladim — ko'rib chiqing.", "Загрузила новые макеты дизайна — посмотрите.", "I uploaded the new design mockups — please take a look.") },
  ],
  announcements: [
    { id: 4, author: "Aziza", initials: "AZ", time: "09:00", body: tri("Juma kuni ofis yopiq bo'ladi.", "В пятницу офис будет закрыт.", "The office will be closed on Friday.") },
  ],
  help: [
    { id: 5, author: "Dmitry", initials: "DM", time: "11:40", body: tri("Kirish parolini qanday tiklash mumkin?", "Как сбросить пароль для входа?", "How do I reset my login password?") },
  ],
  frontend: [
    { id: 6, author: "Sarah", initials: "SA", time: "12:05", body: tri("Yangi komponentlar kutubxonasi tayyor.", "Новая библиотека компонентов готова.", "The new component library is ready.") },
  ],
  backend: [
    { id: 7, author: "Timur", initials: "TI", time: "13:30", body: tri("API javob vaqti 40% tezlashdi.", "Время ответа API стало быстрее на 40%.", "API response time improved by 40%.") },
  ],
  bugs: [
    { id: 8, author: "Dmitry", initials: "DM", time: "14:02", body: tri("Mobil menyu ochilmayapti.", "Мобильное меню не открывается.", "The mobile menu does not open.") },
  ],
  playlists: [
    { id: 9, author: "Aziza", initials: "AZ", time: "18:10", body: tri("Ishlash uchun sokin pleylist qo'shdim.", "Добавила спокойный плейлист для работы.", "Added a calm playlist for focus work.") },
  ],
  releases: [
    { id: 10, author: "Sarah", initials: "SA", time: "19:22", body: tri("Bu haftaning eng zo'r albomi!", "Лучший альбом этой недели!", "Best album of this week!") },
  ],
};

const memberList = [
  { name: "Aziza", initials: "AZ", online: true },
  { name: "Dmitry", initials: "DM", online: true },
  { name: "Sarah", initials: "SA", online: true },
  { name: "Timur", initials: "TI", online: false },
];

function App() {
  const [lang, setLang] = useState<Lang>("uz");
  const t = translations[lang];

  const [serverId, setServerId] = useState("s1");
  const server = servers.find((s) => s.id === serverId)!;
  const [activeByServer, setActiveByServer] = useState<Record<string, string>>({
    s1: "general",
    s2: "frontend",
    s3: "playlists",
  });
  const active = activeByServer[serverId] ?? server.text[0].key;
  const activeChannel = server.text.find((c) => c.key === active) ?? server.text[0];

  const [store, setStore] = useState<Record<string, Msg[]>>(seed);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [compact, setCompact] = useState(false);
  const [voice, setVoice] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const channelMessages = store[active] ?? [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return channelMessages;
    return channelMessages.filter(
      (m) => m.body[lang].toLowerCase().includes(q) || m.author.toLowerCase().includes(q),
    );
  }, [channelMessages, query, lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visible.length, active, serverId]);

  const selectChannel = (key: string) => {
    setActiveByServer((s) => ({ ...s, [serverId]: key }));
    setQuery("");
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const msg: Msg = {
      id: Date.now(),
      author: "Aziza",
      initials: "AZ",
      time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      body: tri(text, text, text),
    };
    setStore((s) => ({ ...s, [active]: [...(s[active] ?? []), msg] }));
    setDraft("");
    setQuery("");
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div className="relative flex h-screen w-full gap-2 overflow-hidden p-2 text-foreground">
        <SpaceBackground />

        {/* Server rail */}
        <nav
          aria-label={t.servers}
          className="glass-panel-strong relative z-10 flex w-[68px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-border/50 py-4"
        >
          {servers.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setServerId(s.id);
                setQuery("");
              }}
              title={s.name[lang]}
              aria-current={s.id === serverId}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all hover:rounded-xl ${s.color} ${
                s.id === serverId
                  ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-transparent"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {s.short}
            </button>
          ))}
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label={t.settings}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-5 w-5" />
          </button>
        </nav>

        {/* Channel sidebar */}
        <aside className="glass-panel relative z-10 flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 text-sidebar-foreground">
          <div className="text-crisp flex h-14 items-center border-b border-sidebar-border/70 px-4 text-base font-semibold">
            {server.name[lang]}
          </div>
          <ScrollArea className="flex-1 px-2 py-4">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.textChannels}
            </p>
            <ul className="space-y-0.5">
              {server.text.map((c) => (
                <li key={c.key}>
                  <button
                    onClick={() => selectChannel(c.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      active === c.key
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Hash className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.name[lang]}</span>
                    {(store[c.key]?.length ?? 0) > 0 && (
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {store[c.key]!.length}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <p className="px-2 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.voiceChannels}
            </p>
            <ul className="space-y-0.5">
              {server.voice.map((c) => {
                const joined = voice === c.key;
                return (
                  <li key={c.key}>
                    <button
                      onClick={() => setVoice(joined ? null : c.key)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        joined
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Volume2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{c.name[lang]}</span>
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
                {t.connected} ·{" "}
                {server.voice.find((v) => v.key === voice)?.name[lang] ?? ""}
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
              AZ
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Aziza</p>
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
            <h1 className="text-crisp text-base font-semibold">{activeChannel.name[lang]}</h1>
            <span className="hidden truncate border-l border-border pl-3 text-sm text-muted-foreground md:block">
              {activeChannel.topic[lang]}
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
              <div
                className={`mx-auto max-w-3xl px-6 py-6 ${compact ? "space-y-2" : "space-y-5"}`}
              >
                <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {query ? t.searchResults : t.today}
                </p>
                {visible.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    {query ? t.noResults : t.emptyChat}
                  </p>
                )}
                {visible.map((m) => (
                  <article key={m.id} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        compact ? "h-7 w-7" : "h-10 w-10"
                      } ${
                        m.author === "Aziza"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {m.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-baseline gap-2">
                        <span className="text-crisp text-sm font-semibold">{m.author}</span>
                        <span className="text-xs text-muted-foreground">{m.time}</span>
                      </p>
                      <p className="text-crisp whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                        {m.body[lang]}
                      </p>
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
                  {memberList.map((m) => (
                    <li key={m.name} className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          m.online
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.online ? t.online : t.offline}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-4">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.messagePlaceholder.replace("{channel}", activeChannel.name[lang])}
              className="h-11"
            />
            <Button type="submit" className="h-11" disabled={!draft.trim()}>
              <Send className="mr-1 h-4 w-4" />
              {t.send}
            </Button>
          </form>
        </main>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.settings}</DialogTitle>
              <DialogDescription>{t.appName}</DialogDescription>
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
              <Button className="w-full" onClick={() => setSettingsOpen(false)}>
                {t.close}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </LangContext.Provider>
  );
}
