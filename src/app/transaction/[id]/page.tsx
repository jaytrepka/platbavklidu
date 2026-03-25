"use client";

import { useState, use } from "react";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Shield, Package, CheckCircle, AlertTriangle, Truck } from "lucide-react";
import { getStatusLabel } from "@/i18n/translations";

interface TransactionData {
  id: string;
  amount: number;
  subject: string | null;
  description: string | null;
  status: string;
  trackingId: string | null;
  createdAt: string;
  updatedAt: string;
  sellerBankAccount?: string;
  buyerEmail?: string;
}

export default function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [showConfirm, setShowConfirm] = useState<"deliver" | "dispute" | null>(null);

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
      // Refresh transaction data
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

  const statusColors: Record<string, string> = {
    WAITING_FOR_PAYMENT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    PAID: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    SUCCESSFULLY_DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    DISPUTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  // Login form
  if (!transaction || !role) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold">{t("appName")}</h1>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="max-w-md mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-6">{t("loginToTransaction")}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("pin")}</label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? t("loading") : t("login")}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Transaction detail
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold">{t("appName")}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {role === "buyer" ? t("buyer") : t("seller")}
          </span>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">{t("transactionDetail")}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[transaction.status] || ""}`}>
              {getStatusLabel(transaction.status, locale)}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-8">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">{t("amount")}</span>
              <span className="font-bold text-lg">{transaction.amount.toLocaleString()} CZK</span>
            </div>
            {transaction.subject && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">{t("subject")}</span>
                <span>{transaction.subject}</span>
              </div>
            )}
            {transaction.description && (
              <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 block mb-1">{t("description")}</span>
                <p className="text-sm">{transaction.description}</p>
              </div>
            )}
            {transaction.trackingId && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 flex items-center gap-1">
                  <Truck className="w-4 h-4" /> {t("trackingId")}
                </span>
                <span className="font-mono">{transaction.trackingId}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">{t("createdAt")}</span>
              <span className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Seller: Add tracking ID when status is PAID */}
          {role === "seller" && transaction.status === "PAID" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                {t("enterTrackingId")}
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder={t("trackingId")}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleShip}
                  disabled={actionLoading || !trackingInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionLoading ? t("loading") : t("confirmShipment")}
                </button>
              </div>
            </div>
          )}

          {/* Buyer: Confirm delivery or dispute when status is SHIPPED */}
          {role === "buyer" && transaction.status === "SHIPPED" && (
            <div className="space-y-3">
              {showConfirm === "deliver" && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                  <p className="mb-4">{t("confirmDeliveryQuestion")}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmDelivery}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {actionLoading ? t("loading") : t("yes")}
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 transition"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              )}

              {showConfirm === "dispute" && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                  <p className="mb-4">{t("confirmDisputeQuestion")}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDispute}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {actionLoading ? t("loading") : t("yes")}
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 transition"
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
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {t("confirmDelivery")}
                  </button>
                  <button
                    onClick={() => setShowConfirm("dispute")}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    {t("fileComplaint")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
