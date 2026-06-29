import { useState, useEffect, createContext, useContext } from 'react';

const translations = {
  en: null, te: null, hi: null,
};

async function loadTranslation(lang) {
  if (translations[lang]) return translations[lang];
  try {
    const r = await fetch(`/locales/${lang}.json`);
    translations[lang] = await r.json();
    return translations[lang];
  } catch { return translations.en || {}; }
}

export const LangContext = createContext({ lang:'en', t: k=>k, setLang:()=>{} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(localStorage.getItem('lang')||'en');
  const [dict, setDict]      = useState({});

  useEffect(() => {
    loadTranslation(lang).then(setDict);
  }, [lang]);

  const setLang = (l) => { setLangState(l); localStorage.setItem('lang', l); };
  const t = (key) => dict[key] || key;

  return <LangContext.Provider value={{ lang, t, setLang }}>{children}</LangContext.Provider>;
}

export function useTranslation() {
  return useContext(LangContext);
}
