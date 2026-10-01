"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import {
  PlusIcon,
  ArrowRightIcon,
  BankIcon,
  TicketIcon,
  UsersIcon,
  CoinsIcon,
  CopyIcon,
  CheckIcon,
  TrashIcon,
  CircleNotchIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { Card } from "@components/reusables/card";
import {
  SelectInput,
  SelectOption,
} from "@components/reusables/basicInputs";

const EXPIRY_OPTIONS: SelectOption[] = [
  { value: 7, label: "Valid for 7 days" },
  { value: 14, label: "Valid for 14 days" },
  { value: 30, label: "Valid for 30 days" },
];

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  usedBy: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

// In-flight singleton promise to deduplicate concurrent requests (e.g. React StrictMode)
let inFlightAdminData: Promise<{
  invites: InviteCode[];
  currencyCount: number;
} | null> | null = null;

async function fetchAdminSummaryData() {
  const [invitesRes, currenciesRes] = await Promise.all([
    api.auth.invites.get(),
    api.currencies.get({ query: {} }),
  ]);

  const invites =
    invitesRes.data?.success && Array.isArray(invitesRes.data.data)
      ? (invitesRes.data.data as InviteCode[])
      : [];

  const currencyCount =
    currenciesRes.data?.success && Array.isArray(currenciesRes.data.data)
      ? currenciesRes.data.data.length
      : 0;

  return { invites, currencyCount };
}

function getAdminData() {
  if (!inFlightAdminData) {
    inFlightAdminData = fetchAdminSummaryData().finally(() => {
      inFlightAdminData = null;
    });
  }
  return inFlightAdminData;
}

export function AdminOverview({ user }: { user: User }) {
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [currencyCount, setCurrencyCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expiresDays, setExpiresDays] = useState(7);

  useEffect(() => {
    let ignore = false;

    getAdminData()
      .then((data) => {
        if (!ignore && data) {
          setInvites(data.invites);
          setCurrencyCount(data.currencyCount);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateInvite = async () => {
    try {
      setGenerating(true);
      const res = await api.auth.invites.post({ expiresInDays: expiresDays });
      if (res.data?.success && res.data.data) {
        setInvites((prev) => [res.data.data as InviteCode, ...prev]);
      }
    } catch (err) {
      console.error("Error creating invite code:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    try {
      const res = await api.auth.invites({ id }).delete();
      if (res.data?.success) {
        setInvites((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error("Error revoking invite code:", err);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const now = new Date();
  const activeInvites = invites.filter(
    (i) => !i.usedBy && new Date(i.expiresAt) > now
  );
  const usedInvites = invites.filter((i) => Boolean(i.usedBy));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Administration Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheckIcon size={12} weight="bold" />
              Admin Mode
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Welcome, {user.name || user.email}. Manage user registration invitations, templates, and system catalogs.
          </p>
        </div>

        {/* Quick Invite Generator in Header */}
        <div className="flex items-center gap-2">
          <div className="w-40">
            <SelectInput
              size="sm"
              isSearchable={false}
              isClearable={false}
              options={EXPIRY_OPTIONS}
              value={EXPIRY_OPTIONS.find((opt) => opt.value === expiresDays)}
              onChange={(selected) => {
                if (selected) setExpiresDays(Number(selected.value));
              }}
            />
          </div>

          <button
            onClick={handleCreateInvite}
            disabled={generating}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 h-9 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {generating ? (
              <CircleNotchIcon size={14} className="animate-spin" />
            ) : (
              <PlusIcon size={14} weight="bold" />
            )}
            <span>Generate Invite</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Invites */}
        <Card className="p-5 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="text-xs font-medium uppercase tracking-wider">
              Available Invites
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TicketIcon size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {loading ? (
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              activeInvites.length
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Codes ready for registration
          </p>
        </Card>

        {/* Claimed / Used Invites */}
        <Card className="p-5 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="text-xs font-medium uppercase tracking-wider">
              Onboarded Users
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <UsersIcon size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {loading ? (
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              usedInvites.length
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Users registered via invites
          </p>
        </Card>

        {/* System Currencies */}
        <Card className="p-5 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="text-xs font-medium uppercase tracking-wider">
              System Currencies
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CoinsIcon size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {loading ? (
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              currencyCount
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Active currencies in catalog
          </p>
        </Card>
      </div>

      {/* User Invitations Table / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <TicketIcon size={14} weight="duotone" className="text-emerald-500" />
            <span>Invitation Codes</span>
          </h2>
          <span className="text-xs text-zinc-400">
            {invites.length} total codes
          </span>
        </div>

        <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <CircleNotchIcon size={16} className="animate-spin text-emerald-500" />
              <span>Loading invitation records...</span>
            </div>
          ) : invites.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No invite codes generated yet
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Click &quot;Generate Invite&quot; above to create invitation codes for new users.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {invites.slice(0, 10).map((invite) => {
                const isUsed = Boolean(invite.usedBy);
                const isExpired = !isUsed && new Date(invite.expiresAt) < now;

                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3.5 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                        {invite.code}
                      </span>

                      {/* Status Badge */}
                      {isUsed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          Used
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      )}

                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-400">
                        <ClockIcon size={12} />
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(invite.code)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Copy invite code"
                      >
                        {copiedCode === invite.code ? (
                          <>
                            <CheckIcon size={13} className="text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {!isUsed && (
                        <button
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Revoke invite"
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Admin Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Administration Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Link
            href="/currencies"
            className="group relative flex items-center justify-between p-4.5 rounded-2xl border border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700/80 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 group-hover:bg-purple-500/10 group-hover:text-purple-500 dark:group-hover:bg-purple-500/15 dark:group-hover:text-purple-400 transition-colors">
                <CoinsIcon size={22} weight="duotone" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                  System Currencies & Rates
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                  Manage universal fiat/crypto catalogs, default base currency, and automated exchange rate updates.
                </p>
              </div>
            </div>
            <ArrowRightIcon size={16} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/templates"
            className="group relative flex items-center justify-between p-4.5 rounded-2xl border border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700/80 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:group-hover:bg-emerald-500/15 dark:group-hover:text-emerald-400 transition-colors">
                <BankIcon size={22} weight="duotone" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  Master Account Templates
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                  Configure default account types and seed categories deployed to new users upon registration.
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
