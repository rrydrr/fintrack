"use client";

import React from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { AdminOverview } from "@/components/partials/overview/adminOverview";
import { UserOverview } from "@/components/partials/overview/userOverview";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <CircleNotchIcon size={28} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (user.role === "admin") {
    return <AdminOverview user={user} />;
  }

  return <UserOverview user={user} />;
}
