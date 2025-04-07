import MainApiPath from "@/constants/api-path"
import { userKeys } from "@/constants/query-key-factory"
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query"
import { HTTPError } from "ky"

import { AppUser } from "@/types/models"

import { MainApiClient } from "../http-client"

type ExtendAccountProps = {
  account: string
  duration: string
}

const extendAccount = async (props: ExtendAccountProps) => {
  const response = await MainApiClient.patch(MainApiPath.accounts.default, {
    json: props,
  }).json<{
    message: string
    user: AppUser
  }>()
  return response.user
}

const useExtendAccount = (
  options?: UseMutationOptions<AppUser, HTTPError, ExtendAccountProps, unknown>
) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: extendAccount,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userKeys.details(data.id), data)
      onSuccess?.(data, variables, context)
    },
    ...restOptions,
  })
}

export default useExtendAccount
