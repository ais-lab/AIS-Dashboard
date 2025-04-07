import { PropsWithChildren, useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  appRoutes,
  isAuthRoute,
  isIgnoreRedirectRoute,
} from "@/constants/routes"
import { AuthContext, localUserKey } from "@/contexts/auth-context"
import { onIdTokenChanged, User } from "firebase/auth"

import { auth } from "@/lib/firebase"

const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter()
  const pathname = usePathname()

  const [isInitialized, setIsInitialized] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)

  const isLoggedIn = !!firebaseUser

  const finishInitialization = () => {
    setTimeout(() => {
      setIsInitialized(true)
    }, 750)
  }

  const handleLocalStorage = useCallback((authUser: User | null) => {
    if (authUser) {
      localStorage.setItem(localUserKey, JSON.stringify(authUser))
    } else {
      localStorage.removeItem(localUserKey)
    }
  }, [])

  const handleIdTokenChanged = useCallback(
    async (authUser: User | null) => {
      setFirebaseUser(authUser)
      const shouldIgnoreRedirect = isIgnoreRedirectRoute(pathname)
      if (shouldIgnoreRedirect) return
      const isLoggedOut = !authUser && !isAuthRoute(pathname)
      if (isLoggedOut) {
        router.replace(appRoutes.login)
        finishInitialization()
        return
      }
      if (!authUser) {
        setIsInitialized(true)
        return
      }
      const shouldRedirect = isAuthRoute(pathname)
      if (shouldRedirect) {
        router.replace(appRoutes.home)
      }
      finishInitialization()
    },
    [pathname, router]
  )

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (_authUser) => {
      handleIdTokenChanged(_authUser)
      handleLocalStorage(_authUser)
    })
    return () => unsubscribe()
  }, [handleIdTokenChanged, handleLocalStorage])

  useEffect(() => {
    const userLocal = localStorage.getItem(localUserKey)
    if (userLocal) {
      const user = JSON.parse(userLocal)
      handleIdTokenChanged(user)
    } else {
      setIsInitialized(true)
    }
  }, [handleIdTokenChanged])

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        isLoggedIn,
        isLoggedOut: !isLoggedIn,
        firebaseUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
