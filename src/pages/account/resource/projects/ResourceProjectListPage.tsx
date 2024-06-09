import { useParams } from "react-router-dom"
import { useRest } from "../../../../hooks/useRest.ts"
import { Resource, ResourceType } from "../../../../types/Identifiable.ts"
import { CircularProgress } from "@nextui-org/react"
import ProjectList from "./ProjectList.tsx"

export default function ResourceProjectListPage({ type }: { type: ResourceType }) {
	const params = useParams()
	const id = params.id

	const { state, data } = useRest<Resource>(`/${ type.toLowerCase() }s/${ id }`, { auto: true })

	return (
		<>
			{ state === "loading" && <CircularProgress aria-label="Lade" className="m-auto"/> }
			{ data && <ProjectList parent={ data }/> }
		</>
	)
}