import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query"
import { FirebaseError } from "firebase/app"
import { signOut } from "firebase/auth"

import { auth } from "@/lib/firebase"

const logout = async () => {
  await signOut(auth)
  localStorage.clear()
}

const useLogout = (options?: UseMutationOptions<void, FirebaseError, void>) => {
  const { onSuccess } = options ?? {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: (data, variables, context) => {
      queryClient.clear()
      onSuccess?.(data, variables, context)
    },
  })
}

export default useLogout
