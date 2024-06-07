import { Resource } from "../../../../types/Identifiable.ts"
import { useRest } from "../../../../hooks/useRest.ts"
import { CircularProgress } from "@nextui-org/react"
import { FileInfo } from "../../../../types/FileInfo.ts"
import { lazy, useEffect } from "react"

const FileDisplay = lazy(() => import("../../../../components/FileDisplay.tsx"))
const FileList = lazy(() => import("./FileList.tsx"))

const INFORMATION_FILE = "Information"

export default function ResourceInfo({ resource }: { resource: Resource }) {
	const { state, head } = useRest<FileInfo>(`/${ resource.resourceType.toLowerCase() }s/${ resource.id }/files/${ INFORMATION_FILE }`)

	useEffect(() => {
		head()
	}, []);

	if(state === "loading" || state === "idle") return <CircularProgress className="m-auto" aria-label="Lade Information"/>
	return (
		<>
			{ state === "success"
				? <FileDisplay resource={ resource } file={ INFORMATION_FILE } className="h-full" contentClassName="bg-default-50"/>
				: <FileList resource={ resource }/>
			}
		</>
	)
}