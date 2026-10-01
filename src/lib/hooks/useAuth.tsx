"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  defaultCurrency: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-flight singleton promise to deduplicate concurrent calls (e.g. React StrictMode)
let inFlightAuthCheck: Promise<User | null> | null = null;

async function sweepAndRedirectToLogin() {
  try {
    await api.auth.logout.post();
  } catch {
    // Ignore network error during logout sweep
  }

  if (typeof document !== "undefined") {
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie =
      "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  }

  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login") &&
    !window.location.pathname.startsWith("/register")
  ) {
    window.location.replace("/login?sweep=1");
  }
}

async function checkSession(): Promise<User | null> {
  try {
    const res = await api.auth.me.get();

    if (res.data?.success && res.data.data) {
      return res.data.data as User;
    }

    const status =
      (res.error as { status?: number })?.status ??
      (res as { status?: number })?.status;

    // If /me returns 404 (user deleted or DB reseeded), sweep session and go to login
    if (status === 404) {
      await sweepAndRedirectToLogin();
      return null;
    }

    // If /me returns 401 (token expired or unauthorized), attempt refresh
    if (status === 401) {
      const refreshRes = await api.auth.refresh.post();
      if (refreshRes.data?.success) {
        const retryRes = await api.auth.me.get();
        if (retryRes.data?.success && retryRes.data.data) {
          return retryRes.data.data as User;
        }

        // Retry /me failed after refresh
        await sweepAndRedirectToLogin();
        return null;
      } else {
        // Refresh failed (401 token expired/invalid, 400, 404, etc.) -> sweep and redirect
        await sweepAndRedirectToLogin();
        return null;
      }
    }

    // Any other unauthenticated response on protected routes
    await sweepAndRedirectToLogin();
    return null;
  } catch {
    await sweepAndRedirectToLogin();
    return null;
  }
}

function getUserProfile(): Promise<User | null> {
  if (!inFlightAuthCheck) {
    inFlightAuthCheck = checkSession().finally(() => {
      inFlightAuthCheck = null;
    });
  }
  return inFlightAuthCheck;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getUserProfile().then((userData) => {
      if (!ignore) {
        setUser(userData);
        setIsLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    const userData = await getUserProfile();
    setUser(userData);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.auth.login.post({
        email: email.trim(),
        password,
      });

      if (res.error) {
        const errVal = res.error.value;
        const msg =
          typeof errVal === "object" && errVal !== null && "error" in errVal
            ? (errVal as { error: string }).error
            : typeof errVal === "string"
            ? errVal
            : "Invalid credentials or login failed.";
        return { success: false, error: msg };
      }

      if (res.data?.success && res.data.data) {
        const loggedInUser = res.data.data as User;
        setUser(loggedInUser);
        return { success: true };
      }

      return { success: false, error: "Login failed." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await api.auth.register.post({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        inviteCode: data.inviteCode.trim(),
      });

      if (res.error) {
        const errVal = res.error.value;
        const msg =
          typeof errVal === "object" && errVal !== null && "error" in errVal
            ? (errVal as { error: string }).error
            : typeof errVal === "string"
            ? errVal
            : "Registration failed.";
        return { success: false, error: msg };
      }

      if (res.data?.success && res.data.data) {
        const registeredUser = res.data.data as User;
        setUser(registeredUser);
        return { success: true };
      }

      return { success: false, error: "Registration failed." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      return { success: false, error: msg };
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const res = await api.auth["verify-email"].post({
        token: token.trim(),
      });

      if (res.error) {
        const errVal = res.error.value;
        const msg =
          typeof errVal === "object" && errVal !== null && "error" in errVal
            ? (errVal as { error: string }).error
            : typeof errVal === "string"
            ? errVal
            : "Verification failed.";
        return { success: false, error: msg };
      }

      if (res.data?.success) {
        // If user data is returned, update local user state
        if (res.data.data) {
          const verifiedUser = res.data.data as User;
          setUser((prev) => (prev ? { ...prev, ...verifiedUser, emailVerified: true } : verifiedUser));
        }
        return {
          success: true,
          message: res.data.message || "Email verified successfully.",
        };
      }

      return { success: false, error: "Verification failed." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      return { success: false, error: msg };
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      const res = await api.auth["resend-verification"].post({
        email: email.trim().toLowerCase(),
      });

      if (res.error) {
        const errVal = res.error.value;
        const msg =
          typeof errVal === "object" && errVal !== null && "error" in errVal
            ? (errVal as { error: string }).error
            : typeof errVal === "string"
            ? errVal
            : "Failed to resend verification email.";
        return { success: false, error: msg };
      }

      if (res.data?.success) {
        return {
          success: true,
          message:
            res.data.message ||
            "If your email is registered, a verification link has been sent.",
        };
      }

      return { success: false, error: "Failed to resend verification email." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout.post();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
