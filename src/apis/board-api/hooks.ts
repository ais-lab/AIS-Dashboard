import { displayItemKeys } from "@/constants/query-key-factory"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useGoogleAuth } from "@/lib/auth/google-auth"

import { Account, BoardItem, callBoardApi, Member } from "./client"

export const boardApiKeys = {
  all: ["board-api"],
  account: (email: string) => [...boardApiKeys.all, "account", email],
  items: () => [...boardApiKeys.all, "items"],
  content: (id: string) => [...boardApiKeys.all, "content", id],
  members: () => [...boardApiKeys.all, "members"],
} as const

export const useAccount = () => {
  const { user } = useGoogleAuth()
  return useQuery({
    queryKey: boardApiKeys.account(user?.email ?? ""),
    queryFn: () => callBoardApi<Account>("me"),
    enabled: !!user,
    staleTime: 60_000,
    retry: false,
  })
}

export const useRequestAccess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (note: string) =>
      callBoardApi<Account>("requestAccess", { note }),
    onSuccess: (account) =>
      queryClient.setQueryData(boardApiKeys.account(account.email), account),
  })
}

export const useBoardItems = (enabled: boolean) =>
  useQuery({
    queryKey: boardApiKeys.items(),
    queryFn: () => callBoardApi<BoardItem[]>("listItems"),
    enabled,
    staleTime: 0,
  })

export const useItemContent = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: boardApiKeys.content(id),
    queryFn: () =>
      callBoardApi<{ id: string; content: string }>("getContent", { id }),
    enabled,
    staleTime: 0,
  })

// After any change, refresh the item list and the board itself.
const useItemMutation = <TArgs>(action: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: TArgs) =>
      callBoardApi<BoardItem>(action, args as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardApiKeys.items() })
      queryClient.invalidateQueries({ queryKey: displayItemKeys.all() })
    },
  })
}

export const useUploadItem = () =>
  useItemMutation<{ filename: string; mimeType: string; data: string }>(
    "upload"
  )

export const useUpdateItem = () =>
  useItemMutation<{ id: string; filename?: string; content?: string }>(
    "updateItem"
  )

export const useDeleteItem = () => useItemMutation<{ id: string }>("deleteItem")

export const useMembers = (enabled: boolean) =>
  useQuery({
    queryKey: boardApiKeys.members(),
    queryFn: () => callBoardApi<Member[]>("listMembers"),
    enabled,
    staleTime: 0,
  })

const useMemberMutation = <TArgs>(action: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: TArgs) =>
      callBoardApi<Member[]>(action, args as Record<string, unknown>),
    onSuccess: (members) =>
      queryClient.setQueryData(boardApiKeys.members(), members),
  })
}

export const useDecideMember = () =>
  useMemberMutation<{ email: string; status: "approved" | "rejected" }>(
    "decide"
  )

export const useSetMemberRole = () =>
  useMemberMutation<{ email: string; role: "admin" | "member" }>("setRole")

export const useRemoveMember = () =>
  useMemberMutation<{ email: string }>("removeMember")
