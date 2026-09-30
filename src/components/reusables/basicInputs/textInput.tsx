import React, { forwardRef } from "react";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = "", error, prefixIcon, suffixIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefixIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            {prefixIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
            prefixIcon ? "pl-10" : ""
          } ${suffixIcon ? "pr-10" : ""} ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/80"
              : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
          } ${className}`}
          {...props}
        />
        {suffixIcon && (
          <div className="absolute right-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
            {suffixIcon}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
