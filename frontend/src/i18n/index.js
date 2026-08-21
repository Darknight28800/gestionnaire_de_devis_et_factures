import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import de from "./locales/de.json";

export const LANGUES_DISPONIBLES = [
    { code: "fr", label: "Français", drapeau: "🇫🇷" },
    { code: "en", label: "English", drapeau: "🇬🇧" },
    { code: "es", label: "Español", drapeau: "🇪🇸" },
    { code: "de", label: "Deutsch", drapeau: "🇩🇪" }
];

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            fr: { translation: fr },
            en: { translation: en },
            es: { translation: es },
            de: { translation: de }
        },
        fallbackLng: "fr",
        supportedLngs: LANGUES_DISPONIBLES.map((l) => l.code),
        interpolation: { escapeValue: false },
        detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: "langue",
            caches: ["localStorage"]
        }
    });

export default i18n;
