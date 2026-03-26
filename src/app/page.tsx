"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { ArrowRight, CheckCircle, Info, TrendingUp, BarChart3 } from "lucide-react";

export default function HomePage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [createdBy, setCreatedBy] = useState<"BUYER" | "SELLER">("BUYER");

  const fee = Math.round(Math.max(amount * 0.01, 10) * 100) / 100;
  const total = Math.round((amount + fee) * 100) / 100;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      sellerEmail: formData.get("sellerEmail") as string,
      buyerEmail: formData.get("buyerEmail") as string,
      amount: parseFloat(formData.get("amount") as string),
      subject: (formData.get("subject") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      createdBy,
    };
    if (createdBy === "SELLER") {
      data.sellerBankAccount = formData.get("sellerBankAccount") as string;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create transaction");
      }

      const result = await res.json();
      setCreatedId(result.id);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
        <div className="max-w-md mx-auto p-10 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">{t("successHeading")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {t("successDescription")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 font-mono bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg inline-block">
            ID: {createdId}
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setCreatedId("");
              setAmount(0);
            }}
            className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg"
          >
            {t("backToHomepage")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-10">
        <div className="p-4 sm:p-6 flex justify-between items-center max-w-4xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size={32} />
            <div>
              <h1 className="text-xl font-bold">{t("appName")}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("appDescription")}</p>
            </div>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero section */}
      <section className="text-center pt-8 pb-4 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            {t("appName")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {t("appDescription")}
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <Logo size={16} />
            Bezpečná platba
          </div>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-6 py-8 w-full flex-1">
        {/* Form card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-none p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {t("createTransaction")}
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </h2>

          {/* Buyer / Seller toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setCreatedBy("BUYER")}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                createdBy === "BUYER"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t("iAmBuyer")}
            </button>
            <button
              type="button"
              onClick={() => setCreatedBy("SELLER")}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                createdBy === "SELLER"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t("iAmSeller")}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("buyerEmail")}</label>
                <input
                  type="email"
                  name="buyerEmail"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("sellerEmail")}</label>
                <input
                  type="email"
                  name="sellerEmail"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {createdBy === "SELLER" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("sellerBankAccount")}</label>
                  <input
                    type="text"
                    name="sellerBankAccount"
                    required
                    placeholder="CZ..."
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("amount")}</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="0.01"
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Fee breakdown */}
            {amount > 0 && (
              <div className="bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("amountWithoutFee")}</span>
                  <span>{amount.toFixed(2)} CZK</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("serviceFee")}</span>
                  <span>{fee.toFixed(2)} CZK</span>
                </div>
                <div className="border-t border-blue-200 dark:border-blue-700/40 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    {t("totalAmount")}
                    <span className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 px-3 py-2 text-xs font-normal text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg z-10">
                        {t("feeTooltip")}
                      </span>
                    </span>
                  </span>
                  <span>{total.toFixed(2)} CZK</span>
                </div>
                {fee === 10 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {t("minFeeNotice")}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">{t("subject")}</label>
              <input
                type="text"
                name="subject"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t("description")}</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("loading") : t("createTransaction")}
            </button>
          </form>
        </div>

        {/* Statistics section */}
        <section className="mt-12">
          <h3 className="text-2xl font-bold text-center mb-2">{t("statsHeading")}</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
            {t("statsDescription")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-blue-50 dark:shadow-none p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <p className="text-3xl font-extrabold">247</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("statsTransactions")}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-blue-50 dark:shadow-none p-6 text-center">
              <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <p className="text-3xl font-extrabold">2 450 000 Kč</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("statsVolume")}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="space-y-1">
            <p>
              {t("contact")}: {t("contactPhone")} · {t("contactEmail")}
            </p>
            <p>
              {t("appName")} &copy; {new Date().getFullYear()}
            </p>
          </div>
          <Link
            href="/terms"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline underline-offset-2"
          >
            {t("terms")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
