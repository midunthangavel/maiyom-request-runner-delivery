import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import en from "@/locales/en.json";
import ta from "@/locales/ta.json";
import hi from "@/locales/hi.json";

export type Locale = "en" | "ta" | "hi";

const translations: Record<Locale, Record<string, string>> = { en, ta, hi };

export const localeNames: Record<Locale, string> = {
    en: "English",
    ta: "தமிழ்",
    hi: "हिन्दी",
};

interface LanguageContextType {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LOCALE_KEY = "maiyom_locale";

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
    return ctx;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const saved = localStorage.getItem(LOCALE_KEY);
        return (saved as Locale) || "en";
    });

    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        localStorage.setItem(LOCALE_KEY, l);
    }, []);

    const t = useCallback(
        (key: string): string => {
            return translations[locale]?.[key] || translations.en[key] || key;
        },
        [locale]
    );

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
