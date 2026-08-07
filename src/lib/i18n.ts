import { createContext, useContext } from "react";

export type Lang = "uz" | "ru" | "en";

export const APP_NAME = "AstroChat";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

type Dict = {
  appName: string;
  tagline: string;
  servers: string;
  textChannels: string;
  voiceChannels: string;
  members: string;
  online: string;
  offline: string;
  messagePlaceholder: string;
  send: string;
  settings: string;
  language: string;
  search: string;
  today: string;
  join: string;
  leave: string;
  connected: string;
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
  loading: string;
  // auth
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  displayName: string;
  displayNamePlaceholder: string;
  continueWithGoogle: string;
  orContinueWith: string;
  noAccount: string;
  haveAccount: string;
  checkEmail: string;
  authWelcome: string;
  authSubtitle: string;
  profile: string;
};

const dict = (d: Dict) => d;

export const translations: Record<Lang, Dict> = {
  uz: dict({
    appName: APP_NAME,
    tagline: "Yulduzlar ostidagi suhbat",
    servers: "Serverlar",
    textChannels: "Matnli kanallar",
    voiceChannels: "Ovozli kanallar",
    members: "A'zolar",
    online: "Onlayn",
    offline: "Oflayn",
    messagePlaceholder: "#{channel} kanaliga xabar yozing",
    send: "Yuborish",
    settings: "Sozlamalar",
    language: "Til",
    search: "Qidirish",
    today: "Xabarlar",
    join: "Qo'shilish",
    leave: "Chiqish",
    connected: "Ulandingiz",
    emptyChat: "Hali xabar yo'q. Birinchi bo'lib yozing!",
    noResults: "Hech narsa topilmadi",
    searchResults: "Qidiruv natijalari",
    clear: "Tozalash",
    close: "Yopish",
    notifications: "Bildirishnomalar",
    compactMode: "Ixcham ko'rinish",
    you: "Siz",
    createChannel: "Kanal yaratish",
    createServer: "Server yaratish",
    addChannel: "Kanal qo'shish",
    addServer: "Server qo'shish",
    channelName: "Kanal nomi",
    channelNamePlaceholder: "yangi-kanal",
    channelType: "Kanal turi",
    textType: "Matnli",
    voiceType: "Ovozli",
    serverName: "Server nomi",
    serverNamePlaceholder: "Mening serverim",
    serverIcon: "Belgi",
    serverIconHint: "2 tagacha belgi",
    create: "Yaratish",
    cancel: "Bekor qilish",
    deleteMessage: "Xabarni o'chirish",
    reactions: "Reaksiyalar",
    loading: "Yuklanmoqda...",
    signIn: "Kirish",
    signUp: "Ro'yxatdan o'tish",
    signOut: "Chiqish",
    email: "Elektron pochta",
    password: "Parol",
    displayName: "Ismingiz",
    displayNamePlaceholder: "Aziza",
    continueWithGoogle: "Google orqali davom etish",
    orContinueWith: "yoki pochta orqali",
    noAccount: "Hisobingiz yo'qmi?",
    haveAccount: "Hisobingiz bormi?",
    checkEmail: "Pochtangizni tekshiring va havolani tasdiqlang.",
    authWelcome: "AstroChat'ga xush kelibsiz",
    authSubtitle: "Kosmik jamoaviy suhbat — UZ, RU va EN tillarida.",
    profile: "Profil",
  }),
  ru: dict({
    appName: APP_NAME,
    tagline: "Общение под звёздами",
    servers: "Серверы",
    textChannels: "Текстовые каналы",
    voiceChannels: "Голосовые каналы",
    members: "Участники",
    online: "В сети",
    offline: "Не в сети",
    messagePlaceholder: "Написать в #{channel}",
    send: "Отправить",
    settings: "Настройки",
    language: "Язык",
    search: "Поиск",
    today: "Сообщения",
    join: "Присоединиться",
    leave: "Выйти",
    connected: "Подключено",
    emptyChat: "Сообщений пока нет. Напишите первым!",
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
    loading: "Загрузка...",
    signIn: "Войти",
    signUp: "Регистрация",
    signOut: "Выйти",
    email: "Электронная почта",
    password: "Пароль",
    displayName: "Ваше имя",
    displayNamePlaceholder: "Дмитрий",
    continueWithGoogle: "Продолжить с Google",
    orContinueWith: "или по почте",
    noAccount: "Нет аккаунта?",
    haveAccount: "Уже есть аккаунт?",
    checkEmail: "Проверьте почту и подтвердите ссылку.",
    authWelcome: "Добро пожаловать в AstroChat",
    authSubtitle: "Космический командный чат — на UZ, RU и EN.",
    profile: "Профиль",
  }),
  en: dict({
    appName: APP_NAME,
    tagline: "Chat under the stars",
    servers: "Servers",
    textChannels: "Text channels",
    voiceChannels: "Voice channels",
    members: "Members",
    online: "Online",
    offline: "Offline",
    messagePlaceholder: "Message #{channel}",
    send: "Send",
    settings: "Settings",
    language: "Language",
    search: "Search",
    today: "Messages",
    join: "Join",
    leave: "Leave",
    connected: "Connected",
    emptyChat: "No messages yet. Be the first to write!",
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
    loading: "Loading...",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    displayName: "Display name",
    displayNamePlaceholder: "Sarah",
    continueWithGoogle: "Continue with Google",
    orContinueWith: "or with email",
    noAccount: "No account yet?",
    haveAccount: "Already have an account?",
    checkEmail: "Check your inbox and confirm the link.",
    authWelcome: "Welcome to AstroChat",
    authSubtitle: "A cosmic team chat — in UZ, RU and EN.",
    profile: "Profile",
  }),
};

export const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}>({ lang: "en", setLang: () => {}, t: translations.en });

export const useLang = () => useContext(LangContext);
