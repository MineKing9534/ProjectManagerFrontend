import { Resource, ResourceType } from "../../../../types/Identifiable.ts"
import FileList from "./FileList.tsx"
import { useParams } from "react-router-dom"
import { useRest } from "../../../../hooks/useRest.ts"
import { CircularProgress } from "@nextui-org/react"

export default function ResourceFileListPage({ type }: { type: ResourceType }) {
	const pathParams = useParams()
	const id = pathParams.id

	const { state, data } = useRest<Resource>(`/${ type.toLowerCase() }s/${ id }`, { auto: true })

	return (
		<>
			{ state === "loading" && <CircularProgress aria-label="Lade" className="m-auto"/> }
			{ data && <FileList resource={ data } full/> }
		</>
	)
}