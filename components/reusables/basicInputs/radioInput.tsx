import React, { forwardRef } from "react";

export interface RadioInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const RadioInput = forwardRef<HTMLInputElement, RadioInputProps>(
  ({ className = "", label, description, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`flex items-start gap-3 cursor-pointer select-none ${className}`}
      >
        <input
          ref={ref}
          id={id}
          type="radio"
          className="mt-0.5 h-4 w-4 rounded-full border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100"
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col text-sm">
            {label && (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {label}
              </span>
            )}
            {description && (
              <span className="text-zinc-500 dark:text-zinc-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

RadioInput.displayName = "RadioInput";
