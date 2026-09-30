import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-600/15" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-600/15" />

      {/* Main card wrapper */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand header (Static / Non-interactive) */}
        <div className="mb-8 text-center select-none">
          <div className="inline-flex items-center gap-2.5 font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50">
            <Image
              src="/logo.svg"
              alt="FinTrack Logo"
              width={40}
              height={40}
              className="rounded-xl shadow-sm pointer-events-none"
              priority
            />
            <span>FinTrack</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Intelligent financial and receipt tracking
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
