"use client";

import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Percent,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

const STEP_KEYS = [
  "howItWorksStep1",
  "howItWorksStep2",
  "howItWorksStep3",
  "howItWorksStep4",
  "howItWorksStep5",
] as const;

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between p-4 sm:p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size={32} />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t("appName")}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("home")}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-10 dark:bg-gray-800">
          <h1 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            {t("termsTitle")}
          </h1>

          {/* How It Works */}
          <section className="mb-10">
            <div className="mb-5 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("howItWorks")}
              </h2>
            </div>

            <ol className="space-y-4">
              {STEP_KEYS.map((key, i) => (
                <li key={key} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-gray-700 dark:text-gray-300">
                    {t(key)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Service Fee */}
          <section className="mb-10 rounded-xl bg-blue-50 p-5 dark:bg-blue-900/20">
            <div className="mb-3 flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("serviceFee")}
              </h2>
            </div>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              {t("feeExplanation")}
            </p>
          </section>

          {/* Disputes */}
          <section className="mb-10 rounded-xl bg-amber-50 p-5 dark:bg-amber-900/20">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reklamace / Disputes
              </h2>
            </div>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              {t("disputeExplanation")}
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <h3 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
            {t("contact")}
          </h3>

          <div className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <a
              href={`tel:${t("contactPhone")}`}
              className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Phone className="h-4 w-4" />
              {t("contactPhone")}
            </a>
            <a
              href={`mailto:${t("contactEmail")}`}
              className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Mail className="h-4 w-4" />
              {t("contactEmail")}
            </a>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("home")}
          </Link>
        </footer>
      </main>
    </div>
  );
}
