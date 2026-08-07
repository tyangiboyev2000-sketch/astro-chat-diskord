import { createContext, useContext } from "react";

export type Lang = "uz" | "ru" | "en";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

type Dict = {
  appName: string;
  servers: string;
  textChannels: string;
  voiceChannels: string;
  general: string;
  announcements: string;
  help: string;
  lounge: string;
  music: string;
  members: string;
  online: string;
  offline: string;
  messagePlaceholder: string;
  send: string;
  settings: string;
  language: string;
  search: string;
  topic: string;
  today: string;
  join: string;
  leave: string;
  connected: string;
  muted: string;
  emptyChat: string;
  noResults: string;
  searchResults: string;
  clear: string;
  close: string;
  notifications: string;
  compactMode: string;
  you: string;
  createChannel: string;
  createServer: string;
  addChannel: string;
  addServer: string;
  channelName: string;
  channelNamePlaceholder: string;
  channelType: string;
  textType: string;
  voiceType: string;
  serverName: string;
  serverNamePlaceholder: string;
  serverIcon: string;
  serverIconHint: string;
  create: string;
  cancel: string;
  deleteMessage: string;
  reactions: string;
};


export const translations: Record<Lang, Dict> = {
  uz: {
    appName: "Suhbat",
    servers: "Serverlar",
    textChannels: "Matnli kanallar",
    voiceChannels: "Ovozli kanallar",
    general: "umumiy",
    announcements: "elonlar",
    help: "yordam",
    lounge: "Dam olish xonasi",
    music: "Musiqa",
    members: "A'zolar",
    online: "Onlayn",
    offline: "Oflayn",
    messagePlaceholder: "#{channel} kanaliga xabar yozing",
    send: "Yuborish",
    settings: "Sozlamalar",
    language: "Til",
    search: "Qidirish",
    topic: "Jamoa uchun umumiy suhbat kanali",
    today: "Bugun",
    join: "Qo'shilish",
    muted: "Ovozsiz",
    emptyChat: "Hali xabar yo'q. Birinchi bo'lib yozing!",
    leave: "Chiqish",
    connected: "Ulandingiz",
    noResults: "Hech narsa topilmadi",
    searchResults: "Qidiruv natijalari",
    clear: "Tozalash",
    close: "Yopish",
    notifications: "Bildirishnomalar",
    compactMode: "Ixcham ko'rinish",
    you: "Siz",
  },
  ru: {
    appName: "Чат",
    servers: "Серверы",
    textChannels: "Текстовые каналы",
    voiceChannels: "Голосовые каналы",
    general: "общий",
    announcements: "объявления",
    help: "помощь",
    lounge: "Комната отдыха",
    music: "Музыка",
    members: "Участники",
    online: "В сети",
    offline: "Не в сети",
    messagePlaceholder: "Написать в #{channel}",
    send: "Отправить",
    settings: "Настройки",
    language: "Язык",
    search: "Поиск",
    topic: "Общий канал для всей команды",
    today: "Сегодня",
    join: "Присоединиться",
    muted: "Без звука",
    emptyChat: "Сообщений пока нет. Напишите первым!",
    leave: "Выйти",
    connected: "Подключено",
    noResults: "Ничего не найдено",
    searchResults: "Результаты поиска",
    clear: "Очистить",
    close: "Закрыть",
    notifications: "Уведомления",
    compactMode: "Компактный режим",
    you: "Вы",
    createChannel: "Создать канал",
    createServer: "Создать сервер",
    addChannel: "Добавить канал",
    addServer: "Добавить сервер",
    channelName: "Название канала",
    channelNamePlaceholder: "новый-канал",
    channelType: "Тип канала",
    textType: "Текстовый",
    voiceType: "Голосовой",
    serverName: "Название сервера",
    serverNamePlaceholder: "Мой сервер",
    serverIcon: "Иконка",
    serverIconHint: "До 2 символов",
    create: "Создать",
    cancel: "Отмена",
    deleteMessage: "Удалить сообщение",
    reactions: "Реакции",
  },
  en: {
    appName: "Chat",
    servers: "Servers",
    textChannels: "Text channels",
    voiceChannels: "Voice channels",
    general: "general",
    announcements: "announcements",
    help: "help",
    lounge: "Lounge",
    music: "Music",
    members: "Members",
    online: "Online",
    offline: "Offline",
    messagePlaceholder: "Message #{channel}",
    send: "Send",
    settings: "Settings",
    language: "Language",
    search: "Search",
    topic: "General channel for the whole team",
    today: "Today",
    join: "Join",
    muted: "Muted",
    emptyChat: "No messages yet. Be the first to write!",
    leave: "Leave",
    connected: "Connected",
    noResults: "Nothing found",
    searchResults: "Search results",
    clear: "Clear",
    close: "Close",
    notifications: "Notifications",
    compactMode: "Compact mode",
    you: "You",
    createChannel: "Create channel",
    createServer: "Create server",
    addChannel: "Add channel",
    addServer: "Add server",
    channelName: "Channel name",
    channelNamePlaceholder: "new-channel",
    channelType: "Channel type",
    textType: "Text",
    voiceType: "Voice",
    serverName: "Server name",
    serverNamePlaceholder: "My server",
    serverIcon: "Icon",
    serverIconHint: "Up to 2 characters",
    create: "Create",
    cancel: "Cancel",
    deleteMessage: "Delete message",
    reactions: "Reactions",
  },
};

export const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}>({ lang: "en", setLang: () => {}, t: translations.en });

export const useLang = () => useContext(LangContext);
