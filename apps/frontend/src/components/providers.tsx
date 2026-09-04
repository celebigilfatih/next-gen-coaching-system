"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "@/lib/socket";
import { queryClientConfig } from "@/lib/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <ErrorBoundary>
      <SessionProvider>
        <SocketProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </SocketProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
