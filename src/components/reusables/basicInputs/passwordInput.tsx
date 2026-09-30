"use client";

import React, { useState, forwardRef } from "react";
import { LockSimpleIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { TextInput, TextInputProps } from "./textInput";

export interface PasswordInputProps
  extends Omit<TextInputProps, "type" | "prefixIcon" | "suffixIcon"> {
  hideToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hideToggle = false, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextInput
        ref={ref}
        type={showPassword ? "text" : "password"}
        prefixIcon={<LockSimpleIcon size={18} />}
        disabled={disabled}
        suffixIcon={
          !hideToggle ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
