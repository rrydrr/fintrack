"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { CircleNotchIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { Navbar } from "@/components/partials/navbar";
import { Footer } from "@/components/partials/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    // Admins cannot manage personal finances (accounts & receipts)
    if (!isLoading && user?.role === "admin") {
      const personalFinanceRoutes = ["/accounts", "/receipts"];
      if (personalFinanceRoutes.some((route) => pathname.startsWith(route))) {
        router.replace("/");
      }
    }
  }, [isLoading, user, pathname, router]);

  // Loading state while verifying authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.svg"
            alt="FinTrack Logo"
            width={48}
            height={48}
            className="animate-pulse rounded-xl"
            priority
          />
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <CircleNotchIcon size={16} className="animate-spin text-emerald-500" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: render nothing while redirecting to /login
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      {user && !user.emailVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 px-4 py-2.5 text-xs transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <EnvelopeSimpleIcon size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Your email address is not verified yet. Please check your inbox to activate your account.</span>
            </div>
            <Link
              href="/verify"
              className="font-semibold underline underline-offset-4 hover:text-amber-900 dark:hover:text-amber-200 transition-colors shrink-0"
            >
              Verify now &rarr;
            </Link>
          </div>
        </div>
      )}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
