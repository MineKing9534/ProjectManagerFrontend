import { Identifiable } from "./Identifiable.ts"

export interface Skill extends Identifiable {
	name: string
	group: string
}

export interface SkillGroup extends Identifiable {
	name: string
}