"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  EnvelopeSimpleIcon,
  WarningCircleIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@components/reusables/card";
import { InputGroup } from "@components/reusables/inputGroup";
import { TextInput } from "@components/reusables/basicInputs/textInput";
import { PasswordInput } from "@components/reusables/basicInputs/passwordInput";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/");
    } else {
      setErrorMessage(result.error || "Login failed. Please check your credentials.");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <CircleNotchIcon size={28} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your FinTrack account to continue
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <div className="flex items-center gap-2">
                <WarningCircleIcon size={18} weight="fill" className="shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <InputGroup label="Email" htmlFor="email" required>
            <TextInput
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="email"
              required
              prefixIcon={<EnvelopeSimpleIcon size={18} />}
            />
          </InputGroup>

          <InputGroup label="Password" htmlFor="password" required>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
              required
            />
          </InputGroup>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <CircleNotchIcon size={18} className="animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
