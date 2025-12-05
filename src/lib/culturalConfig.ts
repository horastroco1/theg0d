export interface CulturalConfig {
  greeting: string;
  dateFormat: string;
  accentColor: string;
  placeholder: string;
  currency: string;
}

export const CULTURAL_VIBES: Record<string, CulturalConfig> = {
  en: {
    greeting: "INITIALIZING PROTOCOL...",
    dateFormat: "MM/DD/YYYY",
    accentColor: "#00FF41", // Matrix Green
    placeholder: "> Enter Command...",
    currency: "USD"
  },
  fa: {
    greeting: "سلام هموطن. سیستم آماده است.",
    dateFormat: "YYYY/MM/DD",
    accentColor: "#00E5FF", // Turquoise (Persian Tile)
    placeholder: "> دستور خود را وارد کنید...",
    currency: "IRT"
  },
  es: {
    greeting: "INICIANDO SISTEMA...",
    dateFormat: "DD/MM/YYYY",
    accentColor: "#FFD700", // Gold
    placeholder: "> Ingrese Comando...",
    currency: "EUR"
  },
  fr: {
    greeting: "INITIALISATION...",
    dateFormat: "DD/MM/YYYY",
    accentColor: "#FF0055", // Neon Pink
    placeholder: "> Entrez la commande...",
    currency: "EUR"
  },
  de: {
    greeting: "SYSTEMSTART...",
    dateFormat: "DD.MM.YYYY",
    accentColor: "#FF5500", // Industrial Orange
    placeholder: "> Befehl eingeben...",
    currency: "EUR"
  },
  ja: {
    greeting: "システム初期化中...",
    dateFormat: "YYYY/MM/DD",
    accentColor: "#FF0000", // Tokyo Red
    placeholder: "> コマンドを入力...",
    currency: "JPY"
  },
  ar: {
    greeting: "جاري بدء النظام...",
    dateFormat: "DD/MM/YYYY",
    accentColor: "#00FF41", 
    placeholder: "> أدخل الأمر...",
    currency: "AED"
  }
};

export const getCulturalConfig = (lang: string): CulturalConfig => {
  return CULTURAL_VIBES[lang] || CULTURAL_VIBES['en'];
};

