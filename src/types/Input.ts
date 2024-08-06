import { Identifiable } from "./Identifiable.ts";

export interface InputData extends Identifiable {
	name: string
	placeholder: string
	type: InputType
	config: string
}

export type InputType = "STRING" | "INTEGER" | "SELECT"

export interface StringConfig {
	minLength?: number
	maxLength?: number
}

export interface IntegerConfig {
	minValue?: number
	maxValue?: number
}

export type SelectConfig = string[]