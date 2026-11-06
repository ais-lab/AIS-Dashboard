"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { duration } from "@/lib/utils/duration"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      retry: 2,
      staleTime: duration.minutes(3),
      retryDelay(failureCount) {
        return duration.seconds(0.8 * failureCount)
      },
    },
  },
})

export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
