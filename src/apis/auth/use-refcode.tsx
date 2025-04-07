import { firestoreCollection } from "@/constants/keys"
import { refCodeKeys } from "@/constants/query-key-factory"
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { doc, getDoc } from "firebase/firestore"

import { RefCode } from "@/types/models"
import { firestore } from "@/lib/firebase"

type GetRefCodeProps = {
  refcode: string
}

const getRefCode = async ({ refcode }: GetRefCodeProps) => {
  if (!refcode) {
    throw new Error("Vui lòng nhập mã giới thiệu")
  }
  const refCodeRef = doc(firestore, firestoreCollection.refcodes, refcode)
  const refCodeDoc = await getDoc(refCodeRef)
  if (!refCodeDoc.exists()) {
    throw new Error("Mã giới thiệu không tồn tại")
  }
  return {
    id: refcode,
    ...refCodeDoc.data(),
  } as RefCode
}

type UseRefCodeOptions = UseMutationOptions<RefCode, Error, GetRefCodeProps>

const useRefCode = (options: UseRefCodeOptions) => {
  return useMutation({
    mutationFn: getRefCode,
    ...options,
  })
}

type UseGetRefCode = GetRefCodeProps &
  Omit<UseQueryOptions<RefCode>, "queryKey">

export const useGetRefCode = (props: UseGetRefCode) => {
  return useQuery({
    queryKey: refCodeKeys.details(props.refcode),
    queryFn: () => getRefCode(props),
    ...props,
  })
}

export default useRefCode
