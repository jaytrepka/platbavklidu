"use client";

import { useI18n } from "@/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale("cs")}
        className={`px-2 py-1 text-sm rounded ${
          locale === "cs"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {t("czech")}
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-1 text-sm rounded ${
          locale === "en"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {t("english")}
      </button>
    </div>
  );
}
