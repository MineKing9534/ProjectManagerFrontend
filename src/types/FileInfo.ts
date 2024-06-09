export interface FileInfo {
	id: string
	name: string
	time: string
	type: FileType
}

export type FileType =
	"FILE" |
	"DIRECTORY"