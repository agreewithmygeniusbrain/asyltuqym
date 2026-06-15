import { locales, type Locale, type Sex, type Species } from "@/lib/types";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function pickLocale(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) {
    return "ru";
  }

  const preferred = acceptLanguage.toLowerCase();

  if (preferred.includes("kk") || preferred.includes("kz")) {
    return "kk";
  }

  return "ru";
}

export const copy = {
  kk: {
    brand: "Асыл Тұқым",
    brandLatin: "Asyl Tuqym",
    tagline: "Сенімді мал саудасы",
    feedTitle: "Ұсынылатын мал лентасы",
    feedLead:
      "Тексерілген сатушылардан жаңа лоттарды қарап, түрі, өңірі және бағасы бойынша тез таңдаңыз.",
    search: "Іздеу",
    filters: "Сүзгілер",
    sell: "Мал сату",
    profile: "Профиль",
    moderation: "Модерация",
    login: "Кіру",
    logout: "Шығу",
    register: "Тіркелу",
    details: "Толығырақ",
    whatsapp: "WhatsApp",
    phone: "Қоңырау",
    verified: "Тексерілген",
    pending: "Модерацияда",
    approved: "Жарияланды",
    rejected: "Қайтарылды",
    sold: "Сатылды",
    archived: "Архив",
    noResults: "Бұл сүзгілер бойынша лот табылмады.",
    recommended: "Ұсынылған",
    newest: "Жаңалары",
    priceAsc: "Баға өсуімен",
    priceDesc: "Баға кемуімен",
    seller: "Сатушы",
    location: "Орналасқан жері",
    price: "Баға",
    age: "Жасы",
    weight: "Салмағы",
    documents: "Құжаттар",
    vaccination: "Вакцинация",
    negotiable: "Саудаласуға болады",
    allSpecies: "Барлық түрлер",
    allRegions: "Барлық өңірлер",
    publicFeed: "Ашық витрина",
    sellerCabinet: "Сатушы кабинеті",
    adminPanel: "Админ панелі",
  },
  ru: {
    brand: "Асыл Тұқым",
    brandLatin: "Asyl Tuqym",
    tagline: "Надежная торговля скотом",
    feedTitle: "Рекомендуемая лента скота",
    feedLead:
      "Листайте свежие лоты от разных продавцов, быстро выбирайте по виду, региону и цене.",
    search: "Поиск",
    filters: "Фильтры",
    sell: "Выставить скот",
    profile: "Профиль",
    moderation: "Модерация",
    login: "Войти",
    logout: "Выйти",
    register: "Регистрация",
    details: "Подробнее",
    whatsapp: "WhatsApp",
    phone: "Позвонить",
    verified: "Проверен",
    pending: "На модерации",
    approved: "Опубликовано",
    rejected: "Отклонено",
    sold: "Продано",
    archived: "Архив",
    noResults: "По этим фильтрам лоты не найдены.",
    recommended: "Рекомендуемые",
    newest: "Новые",
    priceAsc: "Цена по возрастанию",
    priceDesc: "Цена по убыванию",
    seller: "Продавец",
    location: "Местонахождение",
    price: "Цена",
    age: "Возраст",
    weight: "Вес",
    documents: "Документы",
    vaccination: "Вакцинация",
    negotiable: "Возможен торг",
    allSpecies: "Все виды",
    allRegions: "Все регионы",
    publicFeed: "Открытая витрина",
    sellerCabinet: "Кабинет продавца",
    adminPanel: "Админ панель",
  },
} as const;

export const speciesLabels: Record<Locale, Record<Species, string>> = {
  kk: {
    CATTLE: "Ірі қара",
    HORSE: "Жылқы",
    SHEEP: "Қой",
    GOAT: "Ешкі",
    CAMEL: "Түйе",
  },
  ru: {
    CATTLE: "КРС",
    HORSE: "Лошади",
    SHEEP: "Овцы",
    GOAT: "Козы",
    CAMEL: "Верблюды",
  },
};

export const sexLabels: Record<Locale, Record<Sex, string>> = {
  kk: {
    MALE: "Еркек",
    FEMALE: "Ұрғашы",
    MIXED: "Аралас",
  },
  ru: {
    MALE: "Самец",
    FEMALE: "Самка",
    MIXED: "Смешанный гурт",
  },
};

export function formatPrice(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "kk" ? "kk-KZ" : "ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAge(months: number, locale: Locale) {
  const years = Math.floor(months / 12);
  const rest = months % 12;

  if (locale === "kk") {
    if (years === 0) {
      return `${rest} ай`;
    }
    return rest ? `${years} жыл ${rest} ай` : `${years} жыл`;
  }

  if (years === 0) {
    return `${rest} мес.`;
  }

  return rest ? `${years} г. ${rest} мес.` : `${years} г.`;
}
