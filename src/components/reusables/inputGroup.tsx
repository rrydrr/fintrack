import React from "react";

export interface InputGroupProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function InputGroup({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className = "",
  children,
}: InputGroupProps) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium tracking-wide text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
