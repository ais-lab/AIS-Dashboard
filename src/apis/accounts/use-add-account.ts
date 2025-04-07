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

type AddAccountProps = {
  account: string
  nextRun: string
  duration: string
}

const addAccount = async (props: AddAccountProps) => {
  const response = await MainApiClient.post(MainApiPath.accounts.default, {
    json: props,
  }).json<{
    message: string
    user: AppUser
  }>()
  return response.user
}

const useAddAccount = (
  options?: UseMutationOptions<AppUser, HTTPError, AddAccountProps, unknown>
) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: addAccount,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userKeys.details(data.id), data)
      onSuccess?.(data, variables, context)
    },
    ...restOptions,
  })
}

export default useAddAccount
