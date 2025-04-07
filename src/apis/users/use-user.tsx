import { firestoreCollection } from "@/constants/keys"
import { userKeys } from "@/constants/query-key-factory"
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import { doc, getDoc, updateDoc } from "firebase/firestore"

import { AppUser, Order } from "@/types/models"
import { auth, firestore } from "@/lib/firebase"

type GetUserProps = {
  id: string
}

const getUser = async ({ id }: GetUserProps) => {
  const userRef = doc(firestore, firestoreCollection.users, id)
  const userDoc = await getDoc(userRef)
  const { balance = 0, orders = [], ...user } = userDoc.data() || {}

  try {
    if (orders.length > 50) {
      const latestOrders = orders
        .sort((a: Order, b: Order) =>  {
          const aDate = new Date(a.createdAt)
          const bDate = new Date(b.createdAt)
          return bDate.getTime() - aDate.getTime()
        })
        .slice(0, 50)
      await updateDoc(userRef, {
        orders: latestOrders,
      })
    }
  } catch (error) {
    console.error("Error updating user orders", error)
  }

  return {
    id,
    orders,
    balance,
    ...user,
  } as AppUser
}

type UseUserOptions = GetUserProps & Omit<UseQueryOptions<AppUser>, "queryKey">

const useUser = (options: UseUserOptions) => {
  const { id, ...rest } = options
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: userKeys.details(id),
    queryFn: () => getUser({ id }),
    meta: {
      persist: auth.currentUser && id === auth.currentUser.email,
    },
    initialData: queryClient.getQueryData<AppUser>(userKeys.details(id)),
    ...rest,
  })
}

export default useUser
