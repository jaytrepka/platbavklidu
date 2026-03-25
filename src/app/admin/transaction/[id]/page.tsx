"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useI18n } from "@/i18n/context";
import { Logo } from "@/components/Logo";
import { ArrowLeft, MessageSquare, RefreshCw, Clock } from "lucide-react";
import { getStatusLabel } from "@/i18n/translations";
import Link from "next/link";

const STATUSES = [
  "WAITING_FOR_APPROVAL",
  "WAITING_FOR_PAYMENT",
  "PAID",
  "SHIPPED",
  "SUCCESSFULLY_DELIVERED",
  "DISPUTED",
  "COMPLETED",
  "REFUNDED",
  "EXPIRED",
];

interface Comment {
  id: string;
  text: string;
  author: string;
  authorRole: string;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  eventType: string;
  actor: string;
  detail: string | null;
  createdAt: string;
}

interface TransactionDetail {
  id: string;
  sellerEmail: string;
  sellerBankAccount: string;
  buyerEmail: string;
  amount: number;
  subject: string | null;
  description: string | null;
  status: string;
  trackingId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  auditLogs: AuditLogEntry[];
}

export default function AdminTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => sessionStorage.getItem("adminToken") || "";

  const fetchTransaction = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/transactions", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const found = data.find((tx: TransactionDetail) => tx.id === id);
      if (found) {
        setTransaction(found);
        setNewStatus(found.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  async function handleStatusChange() {
    if (!newStatus || newStatus === transaction?.status) return;
    setStatusLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/transaction/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await fetchTransaction();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleAddComment() {
    if (!comment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/admin/transaction/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text: comment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      setComment("");
      await fetchTransaction();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setCommentLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    WAITING_FOR_APPROVAL: "bg-orange-100 text-orange-800",
    WAITING_FOR_PAYMENT: "bg-yellow-100 text-yellow-800",
    PAID: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    SUCCESSFULLY_DELIVERED: "bg-green-100 text-green-800",
    DISPUTED: "bg-red-100 text-red-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    REFUNDED: "bg-pink-100 text-pink-800",
    EXPIRED: "bg-gray-200 text-gray-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Transaction not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Logo size={24} />
          <h1 className="text-lg font-bold">{t("transactionDetail")}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {/* Transaction Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">ID: <span className="font-mono">{transaction.id}</span></h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[transaction.status] || ""}`}>
              {getStatusLabel(transaction.status, locale)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t("buyer")}:</span>
              <span className="ml-2 font-medium">{transaction.buyerEmail}</span>
            </div>
            <div>
              <span className="text-gray-500">{t("seller")}:</span>
              <span className="ml-2 font-medium">{transaction.sellerEmail}</span>
            </div>
            <div>
              <span className="text-gray-500">{t("amount")}:</span>
              <span className="ml-2 font-bold">{transaction.amount.toLocaleString()} CZK</span>
            </div>
            <div>
              <span className="text-gray-500">{t("bankAccount")}:</span>
              <span className="ml-2 font-mono">{transaction.sellerBankAccount}</span>
            </div>
            {transaction.subject && (
              <div>
                <span className="text-gray-500">{t("subject")}:</span>
                <span className="ml-2">{transaction.subject}</span>
              </div>
            )}
            {transaction.trackingId && (
              <div>
                <span className="text-gray-500">{t("trackingId")}:</span>
                <span className="ml-2 font-mono">{transaction.trackingId}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">{t("createdAt")}:</span>
              <span className="ml-2">{new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">{t("updatedAt")}:</span>
              <span className="ml-2">{new Date(transaction.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          {transaction.description && (
            <div className="mt-4 text-sm">
              <span className="text-gray-500">{t("description")}:</span>
              <p className="mt-1">{transaction.description}</p>
            </div>
          )}
        </div>

        {/* Change Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            {t("changeStatus")}
          </h3>
          <div className="flex gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s, locale)}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusChange}
              disabled={statusLoading || newStatus === transaction.status}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
            >
              {statusLoading ? t("loading") : t("save")}
            </button>
          </div>

          {/* Dispute resolution buttons */}
          {transaction.status === "DISPUTED" && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  setStatusLoading(true);
                  setError("");
                  try {
                    const res = await fetch(`/api/admin/transaction/${id}/status`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                      },
                      body: JSON.stringify({ status: "REFUNDED" }),
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      throw new Error(err.error);
                    }
                    await fetchTransaction();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : t("errorOccurred"));
                  } finally {
                    setStatusLoading(false);
                  }
                }}
                disabled={statusLoading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {t("resolveForBuyer")}
              </button>
              <button
                onClick={async () => {
                  setStatusLoading(true);
                  setError("");
                  try {
                    const res = await fetch(`/api/admin/transaction/${id}/status`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                      },
                      body: JSON.stringify({ status: "COMPLETED" }),
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      throw new Error(err.error);
                    }
                    await fetchTransaction();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : t("errorOccurred"));
                  } finally {
                    setStatusLoading(false);
                  }
                }}
                disabled={statusLoading}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {t("resolveForSeller")}
              </button>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            {t("comments")}
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && comment.trim()) handleAddComment(); }}
              placeholder={t("internalComment")}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            />
            <button
              onClick={handleAddComment}
              disabled={commentLoading || !comment.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
            >
              {commentLoading ? t("loading") : t("addComment")}
            </button>
          </div>

          {transaction.comments.length === 0 ? (
            <p className="text-gray-500 text-sm">{t("noComments")}</p>
          ) : (
            <div className="space-y-2">
              {transaction.comments.map((c) => {
                const roleBg = c.authorRole === "ADMIN"
                  ? "bg-yellow-50 dark:bg-yellow-900/20"
                  : c.authorRole === "BUYER"
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "bg-green-50 dark:bg-green-900/20";
                const roleLabel = c.authorRole === "ADMIN"
                  ? t("commentByAdmin")
                  : c.authorRole === "BUYER"
                  ? `${t("commentByBuyer")} (${c.author})`
                  : `${t("commentBySeller")} (${c.author})`;
                return (
                  <div key={c.id} className={`rounded-lg p-3 ${roleBg}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{roleLabel}</span>
                      <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{c.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History / Audit Log */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            {t("history")}
          </h3>

          {transaction.auditLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">{t("noHistory")}</p>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />
              <div className="space-y-4">
                {transaction.auditLogs.map((log) => {
                  const isStatusChange = log.eventType === "STATUS_CHANGE" || log.eventType === "CREATED";
                  const isComment = log.eventType === "COMMENT";
                  const dotColor = isStatusChange
                    ? "bg-blue-500"
                    : isComment
                    ? "bg-green-500"
                    : "bg-gray-400";
                  return (
                    <div key={log.id} className="relative pl-8">
                      <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full ${dotColor} ring-2 ring-white dark:ring-gray-800`} />
                      <div className="text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {log.actor === "admin" ? t("commentByAdmin") : log.actor}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {log.detail && (
                          <p className="text-gray-600 dark:text-gray-400 mt-0.5">{log.detail}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
