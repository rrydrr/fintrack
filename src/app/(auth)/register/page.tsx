"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  UserIcon,
  EnvelopeSimpleIcon,
  TicketIcon,
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, register } = useAuth();

  const codeParam = searchParams.get("code") || searchParams.get("invite") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState(codeParam.toUpperCase());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCode = inviteCode.trim().toUpperCase();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter your name (at least 2 characters).");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!trimmedCode) {
      setErrorMessage("Please enter an invitation code to register.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const result = await register({
      name: trimmedName,
      email: trimmedEmail,
      inviteCode: trimmedCode,
      password,
    });

    if (result.success) {
      router.push("/verify");
    } else {
      setErrorMessage(result.error || "Registration failed. Please check your details.");
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
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your invite code and profile details to get started
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3.5">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <div className="flex items-center gap-2">
                <WarningCircleIcon size={18} weight="fill" className="shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <InputGroup label="Invite Code" htmlFor="inviteCode" required hint="Issued by your platform administrator">
            <TextInput
              id="inviteCode"
              placeholder="e.g. FIN-XXXX-XXXX"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              disabled={submitting}
              autoComplete="off"
              required
              prefixIcon={<TicketIcon size={18} />}
              className="uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
            />
          </InputGroup>

          <InputGroup label="Full Name" htmlFor="name" required>
            <TextInput
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoComplete="name"
              required
              prefixIcon={<UserIcon size={18} />}
            />
          </InputGroup>

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

          <InputGroup label="Password" htmlFor="password" required hint="Minimum 6 characters">
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              required
            />
          </InputGroup>

          <InputGroup label="Confirm Password" htmlFor="confirmPassword" required>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              required
            />
          </InputGroup>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <CircleNotchIcon size={18} className="animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              "Complete Registration"
            )}
          </button>

          <div className="flex flex-col gap-1.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Need an invite code? Contact a platform administrator.
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-12">
          <CircleNotchIcon size={28} className="animate-spin text-emerald-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
