"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import { formatCurrency } from "@formatting/formatNumber";
import {
  WalletIcon,
  ReceiptIcon,
  CreditCardIcon,
  TrendUpIcon,
  PlusIcon,
  ArrowRightIcon,
  BankIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { Card } from "@components/reusables/card";

export interface NetWorthData {
  netWorth: string;
  totalAssets: string;
  totalLiabilities: string;
  accountsCount: number;
  targetCurrency: string;
}

// In-flight singleton promise to deduplicate concurrent requests (e.g. React StrictMode)
let inFlightUserSummary: Promise<NetWorthData | null> | null = null;

async function fetchUserSummaryData() {
  try {
    const res = await api.accounts.summary.get({ query: {} });
    if (res.data?.success && res.data.data) {
      return res.data.data as NetWorthData;
    }
    return null;
  } catch {
    return null;
  }
}

function getUserSummary() {
  if (!inFlightUserSummary) {
    inFlightUserSummary = fetchUserSummaryData().finally(() => {
      inFlightUserSummary = null;
    });
  }
  return inFlightUserSummary;
}

export function UserOverview({ user }: { user: User }) {
  const [summary, setSummary] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);

  const currency = user.defaultCurrency || "IDR";

  useEffect(() => {
    let ignore = false;

    getUserSummary()
      .then((data) => {
        if (!ignore && data) {
          setSummary(data);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const netWorthVal = summary ? parseFloat(summary.netWorth) || 0 : 0;
  const assetsVal = summary ? parseFloat(summary.totalAssets) || 0 : 0;
  const liabilitiesVal = summary ? parseFloat(summary.totalLiabilities) || 0 : 0;
  const accountsCount = summary?.accountsCount || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Financial Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Welcome back{user.name ? `, ${user.name}` : ""}. Here is your financial snapshot.
          </p>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/accounts"
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <PlusIcon size={15} weight="bold" />
            <span>Add Account</span>
          </Link>
          <Link
            href="/receipts"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ReceiptIcon size={15} weight="bold" />
            <span>Upload Receipt</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Worth */}
        <Card className="p-5 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Net Worth
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendUpIcon size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {loading ? (
              <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              formatCurrency(netWorthVal, { currency })
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {accountsCount} active account{accountsCount === 1 ? "" : "s"}
          </p>
        </Card>

        {/* Total Assets */}
        <Card className="p-5 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Assets
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <WalletIcon size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {loading ? (
              <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              formatCurrency(assetsVal, { currency })
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Cash, savings, and investments
          </p>
        </Card>

        {/* Total Liabilities */}
        <Card className="p-5 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Liabilities
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <CreditCardIcon size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {loading ? (
              <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              formatCurrency(liabilitiesVal, { currency })
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Credit cards and payables
          </p>
        </Card>
      </div>

      {/* Getting Started Guide / Quick Navigation */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <SparkleIcon size={15} weight="duotone" className="text-emerald-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Card 1: Accounts */}
          <Link
            href="/accounts"
            className="group relative flex items-center justify-between p-4.5 rounded-2xl border border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700/80 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:group-hover:bg-emerald-500/15 dark:group-hover:text-emerald-400 transition-colors">
                <BankIcon size={22} weight="duotone" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  Accounts Management
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                  Set up checking, savings, wallets, or loan accounts to track your net worth.
                </p>
              </div>
            </div>
            <ArrowRightIcon size={16} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Card 2: Receipts */}
          <Link
            href="/receipts"
            className="group relative flex items-center justify-between p-4.5 rounded-2xl border border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700/80 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 dark:group-hover:bg-cyan-500/15 dark:group-hover:text-cyan-400 transition-colors">
                <ReceiptIcon size={22} weight="duotone" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                  Smart Receipt Extraction
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                  Upload photos or PDFs of receipts. AI automatically detects merchants and line items.
                </p>
              </div>
            </div>
            <ArrowRightIcon size={16} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
