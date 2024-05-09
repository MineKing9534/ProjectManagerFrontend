import { createContext, useContext } from "react"
import { User } from "../types/User.ts"
import { RestRoute } from "./useRest.ts"

export const UserContext = createContext<User | undefined>(undefined)
export const UserRequestContext = createContext<RestRoute<User> | undefined>(undefined)

export function useUser() {
	return useContext(UserContext)
}

export function useUserRequest() {
	return useContext(UserRequestContext)
}