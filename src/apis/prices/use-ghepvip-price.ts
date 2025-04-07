import { firestoreCollection } from "@/constants/keys"
import { priceKeys, userKeys } from "@/constants/query-key-factory"
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import { doc, getDoc } from "firebase/firestore"

import { firestore } from "@/lib/firebase"
import { duration } from "@/lib/utils/duration"

const getPrice = async () => {
  const userRef = doc(firestore, firestoreCollection.prices, "all")
  const userDoc = await getDoc(userRef)
  const { perImage: pricePerImage = 0 } = userDoc.data() || {}

  return pricePerImage
}

type UseUserOptions = Omit<UseQueryOptions<number>, "queryKey">

const useGhepVipPrice = (options?: UseUserOptions) => {
  return useQuery({
    queryKey: priceKeys.details("ghepvip"),
    queryFn: () => getPrice(),
    ...options,
    refetchInterval: duration.minutes(1.75),
  })
}

export default useGhepVipPrice
