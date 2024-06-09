import { Identifiable } from "./Identifiable.ts"

export interface User extends Identifiable {
	admin: boolean
	firstName: string
	lastName: string
	info: string
	email: string
	skills: string[]
	emailTypes: string[]
}