'use client';

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
}
