export interface FileInfo {
	id: number
	name: string
	time: string
	type: FileType
}

export type FileType =
	"FILE" |
	"DIRECTORY"