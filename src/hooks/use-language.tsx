import * as React from "react";
import i18n, { LANG_STORAGE_KEY, type Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === "hi" || stored === "en") return stored;
  const nav = navigator.language || "";
  if (nav.toLowerCase().startsWith("hi")) return "hi";
  return "en";
}

function applyToDocument(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.classList.toggle("lang-hi", lang === "hi");
}

export function useLanguage() {
  const { user } = useAuth();
  const [lang, setLangState] = React.useState<Lang>(
    (i18n.language as Lang) || "en",
  );

  // initial detection (anonymous: localStorage / nav)
  React.useEffect(() => {
    const initial = detectInitial();
    i18n.changeLanguage(initial);
    applyToDocument(initial);
    setLangState(initial);
  }, []);

  // when user logs in, prefer their saved profile language
  React.useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("language_preference")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const pref = (data?.language_preference as Lang | undefined) ?? null;
        if (pref && pref !== i18n.language) {
          i18n.changeLanguage(pref);
          applyToDocument(pref);
          setLangState(pref);
          localStorage.setItem(LANG_STORAGE_KEY, pref);
        }
      });
  }, [user]);

  // listen for changes from anywhere
  React.useEffect(() => {
    const onChange = (l: string) => {
      const v = (l === "hi" ? "hi" : "en") as Lang;
      applyToDocument(v);
      setLangState(v);
    };
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, []);

  const setLang = React.useCallback(
    async (next: Lang) => {
      await i18n.changeLanguage(next);
      applyToDocument(next);
      setLangState(next);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      if (user) {
        supabase
          .from("profiles")
          .update({ language_preference: next })
          .eq("id", user.id)
          .then(() => {});
      }
    },
    [user],
  );

  return { lang, setLang };
}
