import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Hash, Volume2, Send, Settings, Search, Users, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const servers = [
  { id: "s1", short: "UZ", color: "bg-primary text-primary-foreground" },
  { id: "s2", short: "DV", color: "bg-accent text-accent-foreground" },
  { id: "s3", short: "MU", color: "bg-secondary text-secondary-foreground" },
];

const messages = [
  { id: 1, author: "Aziza", time: "10:12", initials: "AZ", body: { uz: "Salom hammaga! Bugungi uchrashuv soat 15:00 da.", ru: "Всем привет! Сегодняшняя встреча в 15:00.", en: "Hi everyone! Today's meeting is at 15:00." } },
  { id: 2, author: "Dmitry", time: "10:15", initials: "DM", body: { uz: "Rahmat, men tayyorman.", ru: "Спасибо, я готов.", en: "Thanks, I'm ready." } },
  { id: 3, author: "Sarah", time: "10:21", initials: "SA", body: { uz: "Yangi dizayn maketlarini yukladim — ko'rib chiqing.", ru: "Загрузила новые макеты дизайна — посмотрите.", en: "I uploaded the new design mockups — please take a look." } },
  { id: 4, author: "Aziza", time: "10:24", initials: "AZ", body: { uz: "Ajoyib! Kechqurun izoh yozaman.", ru: "Отлично! Оставлю комментарии вечером.", en: "Great! I'll leave comments tonight." } },
];

function App() {
  const [lang, setLang] = useState<Lang>("uz");
  const t = translations[lang];
  const [active, setActive] = useState("general");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<{ id: number; text: string; time: string }[]>([]);

  const textChannels = useMemo(
    () => [
      { key: "general", name: t.general },
      { key: "announcements", name: t.announcements },
      { key: "help", name: t.help },
    ],
    [t],
  );
  const voiceChannels = [
    { key: "lounge", name: t.lounge },
    { key: "music", name: t.music },
  ];
  const activeName = textChannels.find((c) => c.key === active)?.name ?? t.general;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSent((s) => [
      ...s,
      { id: Date.now(), text: draft.trim(), time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setDraft("");
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div className="relative flex h-screen w-full gap-2 overflow-hidden p-2 text-foreground">
        <SpaceBackground />
        {/* Server rail */}
        <nav aria-label={t.servers} className="glass-panel-strong relative z-10 flex w-[68px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-border/50 py-4">
          {servers.map((s, i) => (
            <button
              key={s.id}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all hover:rounded-xl ${s.color} ${i === 0 ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-transparent" : "opacity-80 hover:opacity-100"}`}
            >
              {s.short}
            </button>
          ))}
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <Plus className="h-5 w-5" />
          </button>
        </nav>

        {/* Channel sidebar */}
        <aside className="glass-panel relative z-10 flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 text-sidebar-foreground">
          <div className="text-crisp flex h-14 items-center border-b border-sidebar-border/70 px-4 text-base font-semibold">
            {t.appName}
          </div>
          <ScrollArea className="flex-1 px-2 py-4">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.textChannels}
            </p>
            <ul className="space-y-0.5">
              {textChannels.map((c) => (
                <li key={c.key}>
                  <button
                    onClick={() => setActive(c.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${active === c.key ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"}`}
                  >
                    <Hash className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="px-2 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.voiceChannels}
            </p>
            <ul className="space-y-0.5">
              {voiceChannels.map((c) => (
                <li key={c.key}>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
                    <Volume2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                    <span className="ml-auto text-xs">{t.join}</span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <div className="flex items-center gap-2 border-t border-sidebar-border p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              AZ
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Aziza</p>
              <p className="text-xs text-primary">{t.online}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label={t.settings}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="glass-panel relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50">
          <header className="flex h-14 items-center gap-3 border-b border-border px-4">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-crisp text-base font-semibold">{activeName}</h1>
            <span className="hidden truncate border-l border-border pl-3 text-sm text-muted-foreground md:block">
              {t.topic}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t.search} className="h-9 w-40 pl-8" />
              </div>
              <Button variant="ghost" size="icon" aria-label={t.members}>
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

          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
              <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.today}
              </p>
              {messages.map((m) => (
                <article key={m.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                    {m.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-baseline gap-2">
                      <span className="text-crisp text-sm font-semibold">{m.author}</span>
                      <span className="text-xs text-muted-foreground">{m.time}</span>
                    </p>
                    <p className="text-crisp text-[15px] leading-relaxed text-foreground">{m.body[lang]}</p>
                  </div>
                </article>
              ))}
              {sent.map((m) => (
                <article key={m.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    AZ
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-baseline gap-2">
                      <span className="text-crisp text-sm font-semibold">Aziza</span>
                      <span className="text-xs text-muted-foreground">{m.time}</span>
                    </p>
                    <p className="text-crisp whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                      {m.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-4">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.messagePlaceholder.replace("{channel}", activeName)}
              className="h-11"
            />
            <Button type="submit" className="h-11" disabled={!draft.trim()}>
              <Send className="mr-1 h-4 w-4" />
              {t.send}
            </Button>
          </form>
        </main>
      </div>
    </LangContext.Provider>
  );
}
