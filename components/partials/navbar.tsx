"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { SignOutIcon } from "@phosphor-icons/react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems =
    user.role === "admin"
      ? [
          { name: "Overview", href: "/" },
          { name: "Currencies", href: "/currencies" },
          { name: "Templates", href: "/templates" },
        ]
      : [
          { name: "Overview", href: "/" },
          { name: "Accounts", href: "/accounts" },
          { name: "Receipts", href: "/receipts" },
        ];

  const userInitial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="FinTrack Logo"
              width={32}
              height={32}
              className="rounded-lg shadow-xs"
              priority
            />
            <span>FinTrack</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-100/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Pill */}
        <div className="flex items-center">
          <div className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shadow-xs">
            {/* Initial Avatar */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
              {userInitial}
            </div>

            {/* Username & Role */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 max-w-[130px] truncate">
                {user.name || user.email}
              </span>
              {user.role === "admin" && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Admin
                </span>
              )}
            </div>

            {/* Subtle Divider */}
            <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Sign Out Action */}
            <button
              onClick={logout}
              className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Sign out"
            >
              <SignOutIcon size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
