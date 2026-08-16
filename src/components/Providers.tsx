'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui';
import { Toaster } from '@/components/ui/toast';

/**
 * Client-provider shell, mounted once by the root layout.
 *
 * - TanStack Query drives any client-owned polling or mutation flow.
 * - Radix `TooltipProvider` is mounted here so individual `Tooltip`s need no
 *   provider of their own.
 * - `Toaster` is the single mount point for `showToast()`; the store is
 *   module-level, so a second mount would render every toast twice.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
