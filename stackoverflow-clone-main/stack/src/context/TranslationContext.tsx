import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translate, LanguageCode } from "../lib/translations";
import axiosInstance from "../lib/axiosinstance";

interface TranslationContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<LanguageCode>("en");
  const [hydrated, setHydrated] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("language") as LanguageCode | null;
    if (stored) setLangState(stored);
    setHydrated(true);
  }, []);

  // Also sync with backend preference if logged in (best-effort, non-blocking)
  useEffect(() => {
    if (!hydrated) return;
    const user = localStorage.getItem("user");
    if (!user) return;
    axiosInstance
      .get("/language/current")
      .then((res) => {
        const serverLang = res.data?.language as LanguageCode | undefined;
        if (serverLang && serverLang !== lang) {
          setLangState(serverLang);
          localStorage.setItem("language", serverLang);
        }
      })
      .catch(() => {
        /* not logged in or endpoint unavailable — ignore */
      });
  }, [hydrated]);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem("language", newLang);
  };

  const t = (key: string) => translate(key, lang);

  return (
    <TranslationContext.Provider value={{ lang, setLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);