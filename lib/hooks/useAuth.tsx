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

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-flight singleton promise to deduplicate concurrent calls (e.g. React StrictMode)
let inFlightAuthCheck: Promise<User | null> | null = null;

async function checkSession(): Promise<User | null> {
  try {
    const res = await api.auth.me.get();

    if (res.data?.success && res.data.data) {
      return res.data.data as User;
    }

    // Only attempt refresh if the server explicitly responded with 401 (token expired)
    const status = (res.error as { status?: number })?.status;
    if (status === 401) {
      const refreshRes = await api.auth.refresh.post();
      if (refreshRes.data?.success) {
        const retryRes = await api.auth.me.get();
        if (retryRes.data?.success && retryRes.data.data) {
          return retryRes.data.data as User;
        }
      }
    }

    return null;
  } catch {
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

  const login = async (email: string, password: string) => {
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
  };

  const logout = async () => {
    try {
      await api.auth.logout.post();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
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
