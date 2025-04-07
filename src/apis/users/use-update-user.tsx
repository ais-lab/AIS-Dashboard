import MainApiPath from "@/constants/api-path"
import { userKeys } from "@/constants/query-key-factory"
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query"
import { FirebaseError } from "firebase/app"

import { AppUser } from "@/types/models"

import { MainApiClient } from "../http-client"

type UpdateUserProps = {
  id: string
  data: Partial<AppUser>
}

export const updateUser = async ({ id, data }: UpdateUserProps) => {
  await MainApiClient.patch(MainApiPath.users.withId(id), {
    json: data,
  })
}

type UseUpdateUserOptions = UseMutationOptions<
  void,
  FirebaseError,
  UpdateUserProps
>

const useUpdateUser = (options?: UseUpdateUserOptions) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options ?? {}
  return useMutation({
    mutationFn: updateUser,
    onSuccess: async (data, variables, context) => {
      queryClient.setQueryData(
        userKeys.details(variables.id),
        (oldData: AppUser | undefined) => {
          if (!oldData) return oldData
          return { ...oldData, ...variables.data }
        }
      )
      onSuccess?.(data, variables, context)
    },
    ...restOptions,
  })
}

export default useUpdateUser
