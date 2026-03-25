"use client";

import { useState, use } from "react";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Shield,
  Package,
  CheckCircle,
  AlertTriangle,
  Truck,
  Clock,
  CreditCard,
  Ban,
  Info,
  Users,
} from "lucide-react";
import { getStatusLabel } from "@/i18n/translations";
import Link from "next/link";

interface TransactionData {
  id: string;
  amount: number;
  subject: string | null;
  description: string | null;
  status: string;
  trackingId: string | null;
  createdAt: string;
  updatedAt: string;
  sellerEmail?: string;
  qrCodeDataUrl?: string | null;
  buyerEmail?: string;
  sellerBankAccount?: string;
}

export default function TransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"buyer" | "seller" | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<
    "deliver" | "dispute" | null
  >(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/transaction/${id}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      if (!res.ok) {
        throw new Error(t("invalidCredentials"));
      }

      const data = await res.json();
      setTransaction(data.transaction);
      setRole(data.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  }

  async function handleShip() {
    if (!trackingInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transaction/${id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin, trackingId: trackingInput.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const authRes = await fetch(`/api/transaction/${id}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await authRes.json();
      setTransaction(data.transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmDelivery() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transaction/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const authRes = await fetch(`/api/transaction/${id}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await authRes.json();
      setTransaction(data.transaction);
      setShowConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDispute() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transaction/${id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const authRes = await fetch(`/api/transaction/${id}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await authRes.json();
      setTransaction(data.transaction);
      setShowConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setActionLoading(false);
    }
  }

  const statusConfig: Record<
    string,
    { bg: string; icon: React.ReactNode }
  > = {
    WAITING_FOR_PAYMENT: {
      bg: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300",
      icon: <Clock className="w-6 h-6" />,
    },
    PAID: {
      bg: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300",
      icon: <CreditCard className="w-6 h-6" />,
    },
    SHIPPED: {
      bg: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-300",
      icon: <Truck className="w-6 h-6" />,
    },
    SUCCESSFULLY_DELIVERED: {
      bg: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-300",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    DISPUTED: {
      bg: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-300",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    COMPLETED: {
      bg: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  };

  const otherPartyEmail =
    role === "buyer"
      ? transaction?.sellerEmail
      : transaction?.buyerEmail;

  // Login form
  if (!transaction || !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("appName")}
            </h1>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="max-w-md mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-blue-100/50 dark:shadow-none p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {t("loginToTransaction")}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t("pin")}
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? t("loading") : t("login")}
              </button>
            </form>
          </div>
        </main>

        <footer className="max-w-2xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          <div>
            {t("contact")}: {t("contactPhone")} · {t("contactEmail")}
          </div>
          <div className="mt-1">
            <Link href="/terms" className="hover:underline">
              {t("terms")}
            </Link>
            {" · "}
            <Link href="/" className="hover:underline">
              {t("appName")}
            </Link>
          </div>
        </footer>
      </div>
    );
  }

  const cfg = statusConfig[transaction.status] ?? {
    bg: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    icon: <Info className="w-6 h-6" />,
  };

  const totalAmount = transaction.amount;
  const amountWithoutFee = Math.round((totalAmount / 1.01) * 100) / 100;
  const fee = Math.round((totalAmount - amountWithoutFee) * 100) / 100;

  // Transaction detail
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("appName")}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {role === "buyer" ? t("buyer") : t("seller")}
          </span>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-blue-100/50 dark:shadow-none overflow-hidden">
          {/* Status Banner */}
          <div
            className={`w-full px-6 py-4 flex items-center justify-center gap-3 text-lg font-semibold ${cfg.bg}`}
          >
            {cfg.icon}
            {getStatusLabel(transaction.status, locale)}
          </div>

          <div className="p-8 space-y-6">
            {/* Subject heading */}
            {transaction.subject && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {transaction.subject}
              </h2>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Participants */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t("participants")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("you")} ({role === "buyer" ? t("buyer") : t("seller")})
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {email}
                  </span>
                </div>
                {otherPartyEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t("otherParty")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {otherPartyEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction info */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("amount")}
                </span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {transaction.amount.toLocaleString()} CZK
                </span>
              </div>
              {transaction.description && (
                <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">
                    {t("description")}
                  </span>
                  <p className="text-sm text-gray-900 dark:text-gray-200">
                    {transaction.description}
                  </p>
                </div>
              )}
              {transaction.trackingId && (
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Truck className="w-4 h-4" /> {t("trackingId")}
                  </span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {transaction.trackingId}
                  </span>
                </div>
              )}
              {role === "seller" && transaction.sellerBankAccount && (
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("bankAccount")}
                  </span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {transaction.sellerBankAccount}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("createdAt")}
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-200">
                  {new Date(transaction.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* WAITING_FOR_PAYMENT — Buyer: payment card with QR */}
            {transaction.status === "WAITING_FOR_PAYMENT" &&
              role === "buyer" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {t("pleasePay")}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    {t("pleasePayDescription")}
                  </p>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{t("amountWithoutFee")}</span>
                      <span>{amountWithoutFee.toLocaleString()} CZK</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        {t("serviceFee")} (1%)
                        <span
                          title={t("feeTooltip")}
                          className="cursor-help"
                        >
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                      </span>
                      <span>{fee.toLocaleString()} CZK</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span>{t("totalAmount")}</span>
                      <span>{totalAmount.toLocaleString()} CZK</span>
                    </div>
                  </div>

                  {transaction.qrCodeDataUrl && (
                    <div className="flex justify-center pt-2">
                      <img
                        src={transaction.qrCodeDataUrl}
                        alt="QR code"
                        className="w-64 h-64 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

            {/* WAITING_FOR_PAYMENT — Seller: warning */}
            {transaction.status === "WAITING_FOR_PAYMENT" &&
              role === "seller" && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 dark:text-red-300">
                      {t("doNotShip")}
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-400 mt-1">
                      {t("doNotShipDescription")}
                    </p>
                  </div>
                </div>
              )}

            {/* PAID — Seller: Add tracking ID */}
            {role === "seller" && transaction.status === "PAID" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Package className="w-5 h-5 text-blue-600" />
                  {t("enterTrackingId")}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder={t("trackingId")}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleShip}
                    disabled={actionLoading || !trackingInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {actionLoading ? t("loading") : t("confirmShipment")}
                  </button>
                </div>
              </div>
            )}

            {/* SHIPPED — Buyer: Confirm delivery or dispute */}
            {role === "buyer" && transaction.status === "SHIPPED" && (
              <div className="space-y-3">
                {showConfirm === "deliver" && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                    <p className="mb-4 text-gray-900 dark:text-gray-200">
                      {t("confirmDeliveryQuestion")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmDelivery}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {actionLoading ? t("loading") : t("yes")}
                      </button>
                      <button
                        onClick={() => setShowConfirm(null)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition cursor-pointer"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                )}

                {showConfirm === "dispute" && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                    <p className="mb-4 text-gray-900 dark:text-gray-200">
                      {t("confirmDisputeQuestion")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDispute}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {actionLoading ? t("loading") : t("yes")}
                      </button>
                      <button
                        onClick={() => setShowConfirm(null)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition cursor-pointer"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                )}

                {!showConfirm && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirm("deliver")}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {t("confirmDelivery")}
                    </button>
                    <button
                      onClick={() => setShowConfirm("dispute")}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      {t("fileComplaint")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-2xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
        <div>
          {t("contact")}: {t("contactPhone")} · {t("contactEmail")}
        </div>
        <div className="mt-1">
          <Link href="/terms" className="hover:underline">
            {t("terms")}
          </Link>
          {" · "}
          <Link href="/" className="hover:underline">
            {t("appName")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
