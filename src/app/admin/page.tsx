"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { LogOut, Filter } from "lucide-react";
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

interface Transaction {
  id: string;
  sellerEmail: string;
  buyerEmail: string;
  amount: number;
  subject: string | null;
  status: string;
  trackingId: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const { t, locale } = useI18n();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `/api/admin/transactions?status=${filterStatus}`
        : "/api/admin/transactions";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setToken(null);
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    const saved = sessionStorage.getItem("adminToken");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) {
      fetchTransactions(token);
    }
  }, [token, filterStatus, fetchTransactions]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error(t("invalidCredentials"));
      const data = await res.json();
      setToken(data.token);
      sessionStorage.setItem("adminToken", data.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    setToken(null);
    sessionStorage.removeItem("adminToken");
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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Logo size={32} />
                <h1 className="text-xl font-bold">{t("adminLogin")}</h1>
              </Link>
            </div>
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("password")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loginLoading ? t("loading") : t("login")}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size={24} />
            <h1 className="text-lg font-bold">{t("appName")} – {t("admin")}</h1>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              <LogOut className="w-4 h-4" /> {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t("allTransactions")}</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">{t("allStatuses")}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s, locale)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-500">{t("loading")}</p>
        ) : transactions.length === 0 ? (
          <p className="text-center py-12 text-gray-500">{t("noTransactions")}</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">{t("buyer")}</th>
                    <th className="px-4 py-3 text-left font-medium">{t("seller")}</th>
                    <th className="px-4 py-3 text-left font-medium">{t("amount")}</th>
                    <th className="px-4 py-3 text-left font-medium">{t("subject")}</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">{t("createdAt")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/transaction/${tx.id}`}
                          className="text-blue-600 hover:underline font-mono text-xs"
                        >
                          {tx.id.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-4 py-3">{tx.buyerEmail}</td>
                      <td className="px-4 py-3">{tx.sellerEmail}</td>
                      <td className="px-4 py-3 font-medium">{tx.amount.toLocaleString()} CZK</td>
                      <td className="px-4 py-3">{tx.subject || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tx.status] || ""}`}>
                          {getStatusLabel(tx.status, locale)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
