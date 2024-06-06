export interface Identifiable {
	id: string
}

export interface Resource {
	id: string
	name: string
	resourceType: ResourceType
	parent: string
}

export type ResourceType = "TEAM" | "MEETING"