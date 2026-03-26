"use client";

import { useState, useEffect, useCallback, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Truck,
  Clock,
  CreditCard,
  Ban,
  Info,
  Users,
  MessageSquare,
  Send,
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
  needsApproval?: boolean;
  needsBankAccount?: boolean;
  waitingForOtherApproval?: boolean;
}

function TransactionContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t, locale } = useI18n();

  const [role, setRole] = useState<"buyer" | "seller" | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState("");
  const [noTracking, setNoTracking] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<"deliver" | "dispute" | null>(
    null
  );
  const [bankAccountInput, setBankAccountInput] = useState("");
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [comments, setComments] = useState<{ id: string; text: string; author: string; authorRole: string; createdAt: string }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/transaction/${id}/comments?token=${token}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // silently fail
    }
  }, [id, token]);

  const authenticate = useCallback(async () => {
    if (!token) {
      setError(t("invalidCredentials"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/transaction/${id}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw new Error(t("invalidCredentials"));
      }

      const data = await res.json();
      setTransaction(data.transaction);
      setRole(data.role);
      fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  }, [id, token, t, fetchComments]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  async function refreshTransaction() {
    try {
      const authRes = await fetch(`/api/transaction/${id}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await authRes.json();
      setTransaction(data.transaction);
      setRole(data.role);
      fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    }
  }

  async function handleAddComment() {
    if (!commentText.trim() || !token) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/transaction/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, text: commentText.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setCommentText("");
      fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleApprove() {
    setActionLoading(true);
    setError("");
    try {
      const body: Record<string, string> = { token: token! };
      if (bankAccountInput.trim()) {
        body.bankAccount = bankAccountInput.trim();
      }

      const res = await fetch(`/api/transaction/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setApprovalSuccess(true);
      await refreshTransaction();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleShip() {
    if (!noTracking && !trackingInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transaction/${id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, trackingId: noTracking ? undefined : trackingInput.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await refreshTransaction();
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
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await refreshTransaction();
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
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await refreshTransaction();
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
    WAITING_FOR_APPROVAL: {
      bg: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-300",
      icon: <Clock className="w-6 h-6" />,
    },
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
    REFUNDED: {
      bg: "bg-pink-100 text-pink-900 dark:bg-pink-900/40 dark:text-pink-300",
      icon: <Ban className="w-6 h-6" />,
    },
    EXPIRED: {
      bg: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
      icon: <Clock className="w-6 h-6" />,
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-10">
          <div className="p-4 sm:p-6 flex justify-between items-center max-w-4xl mx-auto">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo size={32} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("appName")}
              </h1>
            </Link>
            <LanguageSwitcher />
          </div>
        </header>
        <main className="max-w-md mx-auto px-6 py-12 text-center">
          <p className="text-gray-500">{t("loading")}</p>
        </main>
      </div>
    );
  }

  // Error state (no token or invalid token)
  if (!transaction || !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-10">
          <div className="p-4 sm:p-6 flex justify-between items-center max-w-4xl mx-auto">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo size={32} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("appName")}
              </h1>
            </Link>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="max-w-md mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-blue-100/50 dark:shadow-none p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {t("invalidCredentials")}
            </h2>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
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

  const otherPartyEmail =
    role === "buyer" ? transaction.sellerEmail : transaction.buyerEmail;

  const cfg = statusConfig[transaction.status] ?? {
    bg: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    icon: <Info className="w-6 h-6" />,
  };

  const baseAmount = transaction.amount;
  const feeAmount = Math.round(Math.max(baseAmount * 0.01, 10) * 100) / 100;
  const totalAmount = Math.round((baseAmount + feeAmount) * 100) / 100;

  // Transaction detail
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-10">
        <div className="p-4 sm:p-6 flex justify-between items-center max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size={32} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("appName")}
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {role === "buyer" ? t("buyer") : t("seller")}
            </span>
            <LanguageSwitcher />
          </div>
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

            {approvalSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
                {t("transactionApproved")}
              </div>
            )}

            {/* Approval UI */}
            {transaction.needsApproval && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {t("approveTransaction")}
                </h3>

                {/* Transaction summary for approval */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{t("amount")}</span>
                    <span className="font-bold">
                      {transaction.amount.toLocaleString()} CZK
                    </span>
                  </div>
                  {transaction.subject && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{t("subject")}</span>
                      <span>{transaction.subject}</span>
                    </div>
                  )}
                  {transaction.description && (
                    <div className="text-gray-600 dark:text-gray-400">
                      <span>{t("description")}: </span>
                      <span>{transaction.description}</span>
                    </div>
                  )}
                  {otherPartyEmail && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{t("otherParty")}</span>
                      <span>{otherPartyEmail}</span>
                    </div>
                  )}
                </div>

                {/* Bank account input for seller approving buyer-created tx */}
                {transaction.needsBankAccount && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                      {t("enterBankAccount")}
                    </label>
                    <input
                      type="text"
                      value={bankAccountInput}
                      onChange={(e) => setBankAccountInput(e.target.value)}
                      placeholder="CZ..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <button
                  onClick={handleApprove}
                  disabled={
                    actionLoading ||
                    (transaction.needsBankAccount === true &&
                      !bankAccountInput.trim())
                  }
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {actionLoading
                    ? t("loading")
                    : transaction.needsBankAccount
                    ? t("approveAndEnterBank")
                    : t("approveTransaction")}
                </button>
              </div>
            )}

            {/* Waiting for other party approval */}
            {transaction.waitingForOtherApproval && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 flex items-start gap-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-300">
                    {t("waitingForApproval")}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                    {t("waitingForOtherParty")}
                  </p>
                </div>
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
                    {role === "buyer"
                      ? transaction.buyerEmail
                      : transaction.sellerEmail}
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
                      <span>{baseAmount.toLocaleString()} CZK</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        {t("serviceFee")}
                        <span className="relative group">
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 px-3 py-2 text-xs font-normal text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg z-10">
                            {t("feeTooltip")}
                          </span>
                        </span>
                      </span>
                      <span>{feeAmount.toLocaleString()} CZK</span>
                    </div>
                    {feeAmount === 10 && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {t("minFeeNotice")}
                      </p>
                    )}
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

            {/* PAID — Buyer: waiting for seller to ship */}
            {role === "buyer" && transaction.status === "PAID" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 flex items-start gap-4">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-300">
                    {t("paymentReceived")}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                    {t("waitingForShipment")}
                  </p>
                </div>
              </div>
            )}

            {/* PAID — Seller: Add tracking ID */}
            {role === "seller" && transaction.status === "PAID" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-3">
                <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                  <Package className="w-5 h-5 text-blue-600" />
                  {t("enterTrackingId")}
                </h3>
                {!noTracking && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder={t("trackingId")}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noTracking}
                    onChange={(e) => setNoTracking(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  {t("noTrackingNumber")}
                </label>
                <button
                  onClick={handleShip}
                  disabled={actionLoading || (!noTracking && !trackingInput.trim())}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {actionLoading ? t("loading") : t("confirmShipment")}
                </button>
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

        {/* Comments Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-blue-100/50 dark:shadow-none p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            {t("comments")}
          </h3>

          {/* Add comment */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && commentText.trim()) handleAddComment(); }}
              placeholder={t("writeComment")}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddComment}
              disabled={commentLoading || !commentText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {commentLoading ? t("loading") : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">{t("noComments")}</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => {
                const isMe = (role === "buyer" && c.authorRole === "BUYER") || (role === "seller" && c.authorRole === "SELLER");
                const roleLabel = c.authorRole === "BUYER" ? t("commentByBuyer") : c.authorRole === "SELLER" ? t("commentBySeller") : t("commentByAdmin");
                const roleBg = c.authorRole === "ADMIN" ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" : isMe ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600";
                return (
                  <div key={c.id} className={`rounded-lg p-3 border ${roleBg}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {roleLabel} {isMe && `(${t("you")})`}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-200">{c.text}</p>
                  </div>
                );
              })}
            </div>
          )}
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

export default function TransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <TransactionContent id={id} />
    </Suspense>
  );
}
