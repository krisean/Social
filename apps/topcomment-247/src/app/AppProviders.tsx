import { useMemo } from "react";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../providers/AuthProvider";
import { ThemeProvider } from "../shared/providers/ThemeProvider";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    },
  });

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;