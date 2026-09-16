"use client";

import { StudioProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StudioProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
    </StudioProvider>
  );
}
