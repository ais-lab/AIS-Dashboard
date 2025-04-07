import MainApiPath from "@/constants/api-path"
import { userKeys } from "@/constants/query-key-factory"
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query"
import { HTTPError } from "ky"
import _unset from "lodash/unset"

import { AppUser } from "@/types/models"
import { auth } from "@/lib/firebase"

import { MainApiClient } from "../http-client"

type DeleteAccountProps = {
  accountId: string
}

const deleteAccount = async (props: DeleteAccountProps) => {
  await MainApiClient.delete(MainApiPath.accounts.default, {
    searchParams: {
      account: props.accountId,
    },
  }).json<void>()
}

const useDeleteAccount = (
  options?: UseMutationOptions<void, HTTPError, DeleteAccountProps, unknown>
) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<AppUser>(
        userKeys.details(auth.currentUser!.email!),
        (old) => {
          if (!old) return
          const { accounts } = old
          if (!accounts) return old
          const newAccounts = { ...accounts }
          _unset(newAccounts, variables.accountId)
          return {
            ...old,
            accounts: {
              ...newAccounts,
            },
          }
        }
      )
      onSuccess?.(data, variables, context)
    },
    ...restOptions,
  })
}

export default useDeleteAccount
