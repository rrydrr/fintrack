import React, { forwardRef } from "react";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="date"
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950 dark:text-zinc-100 ${
          error
            ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/80"
            : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
        } ${className}`}
        {...props}
      />
    );
  }
);

DateInput.displayName = "DateInput";
