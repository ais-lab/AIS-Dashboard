"use client"

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import {
  persistQueryClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client"

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

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : null,
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: duration.minutes(7.5),
  dehydrateOptions: {
    shouldDehydrateQuery: ({ meta }) => meta?.persist === true,
  },
})

export const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
