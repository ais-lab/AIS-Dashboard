import { AppUser } from "@/types/models"
import { User } from "firebase/auth"
import { createContext, useContext } from "react"


type AuthContextValue = {
  isInitialized: boolean
  isLoggedIn: boolean
  isLoggedOut: boolean
  user?: AppUser
  firebaseUser?: User | null
}

const AuthContext = createContext<AuthContextValue>({
  isInitialized: false,
  isLoggedIn: false,
  isLoggedOut: true,
  firebaseUser: null,
})

const useAuth = () => useContext(AuthContext)

export const localUserKey = "__user__"

export { AuthContext, useAuth }
