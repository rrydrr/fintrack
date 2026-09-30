import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-white/50 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4">
        <p>© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
      </div>
    </footer>
  );
}
