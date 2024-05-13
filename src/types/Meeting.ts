import { Resource } from "./Identifiable.ts"

export interface Meeting extends Resource {
	type: MeetingType
	location: string
	time: string
}

export type MeetingType = "EVENT" | "PRACTICE" | "MEETING"