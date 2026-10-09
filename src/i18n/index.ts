import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, LANGUAGES } from "./locales";

const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
const initial = stored && LANGUAGES.some((l) => l.code === stored) ? stored : "fr";

const applyDir = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
};

i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});
applyDir(initial);
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  applyDir(lng);
});

export default i18n;
