export interface Identifiable {
	id: string
}

export interface Resource {
	id: string
	name: string
	resourceType: ResourceType
}

export type ResourceType = "TEAM" | "MEETING"