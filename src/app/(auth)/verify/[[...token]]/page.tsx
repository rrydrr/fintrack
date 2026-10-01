"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  EnvelopeSimpleIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  CircleNotchIcon,
  ArrowRightIcon,
  PaperPlaneTiltIcon,
  KeyIcon,
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

type VerificationStatus = "idle" | "verifying" | "success" | "error";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, verifyEmail, resendVerification, refetchUser } = useAuth();

  // Extract token from either route params (/verify/[token]) or query params (?token=...)
  const pathToken = Array.isArray(params?.token)
    ? params.token[0]
    : typeof params?.token === "string"
    ? params.token
    : "";
  const queryToken = searchParams.get("token") || "";
  const initialToken = (pathToken || queryToken).trim();

  // Resend email query param prefill if provided
  const queryEmail = searchParams.get("email") || "";

  const [status, setStatus] = useState<VerificationStatus>(
    initialToken ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual token input state (for users who arrive at /verify without a token)
  const [manualToken, setManualToken] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Resend email state (derives initial value from query param or user email, with local override)
  const [customResendEmail, setCustomResendEmail] = useState<string | null>(null);
  const resendEmail = customResendEmail ?? (queryEmail || user?.email || "");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-redirect countdown on success
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Deduplication ref for React StrictMode / double effect execution
  const attemptedTokenRef = useRef<string | null>(null);

  // Handle countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle auto-redirect countdown on verification success
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      router.push(user ? "/" : "/login");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, router, user]);

  // Execute verification logic
  const handleVerify = useCallback(async (tokenToVerify: string) => {
    const cleanToken = tokenToVerify.trim();
    if (!cleanToken) {
      setErrorMessage("Please enter a valid verification token.");
      setStatus("error");
      return;
    }

    setStatus("verifying");
    setErrorMessage(null);

    const result = await verifyEmail(cleanToken);

    if (result.success) {
      setStatus("success");
      setSuccessMessage(result.message || "Your email has been verified successfully!");
      // Refresh current user session so emailVerified is instantly updated everywhere
      refetchUser().catch(() => {});
      // Start auto-redirect countdown
      setRedirectCountdown(5);
    } else {
      setStatus("error");
      setErrorMessage(
        result.error || "Verification failed. The token may be invalid or expired."
      );
    }
  }, [verifyEmail, refetchUser]);

  // Automatically trigger verification if token is present in URL
  useEffect(() => {
    if (initialToken && attemptedTokenRef.current !== initialToken) {
      attemptedTokenRef.current = initialToken;
      handleVerify(initialToken);
    }
  }, [initialToken, handleVerify]);

  // Handle resend verification email submission
  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const targetEmail = (resendEmail || user?.email || "").trim().toLowerCase();
    if (!targetEmail) {
      setErrorMessage("Please enter an email address to receive a verification link.");
      return;
    }

    setIsResending(true);
    setResendSuccess(null);
    setErrorMessage(null);

    const result = await resendVerification(targetEmail);
    setIsResending(false);

    if (result.success) {
      setResendSuccess(
        result.message ||
          "If your email is registered with us, a fresh verification link has been sent. Please check your inbox and spam folder."
      );
      setResendCooldown(60); // 60s cooldown to prevent rate limiting
    } else {
      setErrorMessage(result.error || "Failed to resend verification email. Please try again.");
    }
  };

  // Loading state while checking auth
  if (authLoading && status === "idle") {
    return (
      <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CircleNotchIcon size={32} className="animate-spin text-emerald-500 mb-3" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Checking session...
          </p>
        </CardContent>
      </Card>
    );
  }

  // 1. STATE: Already verified logged-in user visiting /verify without a token
  if (!initialToken && status === "idle" && user?.emailVerified) {
    return (
      <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircleIcon size={32} weight="fill" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Email Already Verified
          </CardTitle>
          <CardDescription>
            Your account ({user.email}) is already verified and has full platform access.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-3 mt-4">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span>Go to Dashboard</span>
            <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // 2. STATE: In-flight verification loading
  if (status === "verifying") {
    return (
      <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <CardHeader className="text-center space-y-3 py-10">
          <div className="mx-auto relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CircleNotchIcon size={36} className="animate-spin text-emerald-600 dark:text-emerald-400" />
            <div className="absolute inset-0 rounded-2xl animate-ping bg-emerald-500/10 -z-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verifying your email
          </CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            Please wait while we validate your security token and activate your account...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 3. STATE: Verification Success
  if (status === "success") {
    return (
      <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 ring-8 ring-emerald-500/10 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircleIcon size={36} weight="fill" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Email Verified!
          </CardTitle>
          <CardDescription>
            {successMessage || "Your email has been confirmed. You now have complete access to all FinTrack features."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-center text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <p className="font-medium">
              Account activation complete
            </p>
            {redirectCountdown !== null && (
              <p className="mt-1 text-emerald-700/80 dark:text-emerald-400/80">
                Redirecting you in {redirectCountdown} {redirectCountdown === 1 ? "second" : "seconds"}...
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link
            href={user ? "/" : "/login"}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span>{user ? "Continue to Dashboard" : "Sign in to FinTrack"}</span>
            <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // 4. STATE: Verification Failure or Error
  if (status === "error") {
    return (
      <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 ring-8 ring-red-500/5 dark:bg-red-500/20 dark:text-red-400">
            <WarningCircleIcon size={32} weight="fill" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verification Failed
          </CardTitle>
          <CardDescription>
            {errorMessage || "The verification link is invalid or has expired."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {resendSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircleIcon size={16} weight="fill" className="shrink-0 text-emerald-600" />
                <span>{resendSuccess}</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-3 dark:border-zinc-800/80 dark:bg-zinc-800/30">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Need a new verification link?
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Verification links expire after 24 hours. Enter your email to receive a new one.
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-3">
              <TextInput
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setCustomResendEmail(e.target.value)}
                disabled={isResending || resendCooldown > 0}
                required
                prefixIcon={<EnvelopeSimpleIcon size={16} />}
              />

              <button
                type="submit"
                disabled={isResending || resendCooldown > 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
              >
                {isResending ? (
                  <>
                    <CircleNotchIcon size={14} className="animate-spin" />
                    <span>Sending email...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend available in {resendCooldown}s</span>
                ) : (
                  <>
                    <PaperPlaneTiltIcon size={14} />
                    <span>Request New Verification Link</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Link
            href={user ? "/" : "/login"}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            &larr; Back to {user ? "Dashboard" : "Sign in"}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // 5. STATE: Pending / Waiting for verification (User visits /verify without token)
  return (
    <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 ring-8 ring-cyan-500/5 dark:bg-cyan-500/20 dark:text-cyan-400">
          <EnvelopeSimpleIcon size={32} weight="duotone" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Verify your email
        </CardTitle>
        <CardDescription>
          {user ? (
            <>
              We sent a verification link to{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">{user.email}</strong>.
              Please click the link in your email to activate your account.
            </>
          ) : (
            "Confirm your email address to unlock full access to FinTrack."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <div className="flex items-center gap-2">
              <WarningCircleIcon size={16} weight="fill" className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {resendSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircleIcon size={16} weight="fill" className="shrink-0 text-emerald-600" />
              <span>{resendSuccess}</span>
            </div>
          </div>
        )}

        {/* Resend Action Box */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-3 dark:border-zinc-800/80 dark:bg-zinc-800/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Didn&apos;t receive the email?
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Check spam / junk
            </span>
          </div>

          {!user && (
            <TextInput
              type="email"
              placeholder="you@example.com"
              value={resendEmail}
              onChange={(e) => setCustomResendEmail(e.target.value)}
              disabled={isResending || resendCooldown > 0}
              required
              prefixIcon={<EnvelopeSimpleIcon size={16} />}
            />
          )}

          <button
            type="button"
            onClick={() => handleResend()}
            disabled={isResending || resendCooldown > 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
          >
            {isResending ? (
              <>
                <CircleNotchIcon size={14} className="animate-spin" />
                <span>Sending email...</span>
              </>
            ) : resendCooldown > 0 ? (
              <span>Resend available in {resendCooldown}s</span>
            ) : (
              <>
                <PaperPlaneTiltIcon size={14} />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Token Entry Accordion */}
        <div className="pt-2">
          {!showManualInput ? (
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="w-full text-center text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Have a verification token code? Enter it manually &rarr;
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-zinc-200/80 p-3.5 dark:border-zinc-800/80">
              <InputGroup
                label="Verification Token"
                htmlFor="manualToken"
                hint="Paste token from link or platform admin"
              >
                <TextInput
                  id="manualToken"
                  placeholder="Paste your 64-character token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  prefixIcon={<KeyIcon size={16} />}
                  className="font-mono text-xs"
                />
              </InputGroup>

              <button
                type="button"
                onClick={() => handleVerify(manualToken)}
                disabled={!manualToken.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircleIcon size={16} />
                <span>Confirm & Verify</span>
              </button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-2 text-center">
        <Link
          href={user ? "/" : "/login"}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          &larr; Return to {user ? "Dashboard" : "Sign in"}
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card className="border border-zinc-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <CardContent className="flex justify-center items-center py-16">
            <CircleNotchIcon size={32} className="animate-spin text-emerald-500" />
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
