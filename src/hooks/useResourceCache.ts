import { useRest } from "./useRest.ts"
import { Resource } from "../types/Identifiable.ts"
import { useMap } from "usehooks-ts"

export function useResourceCache<T extends Resource>() {
	const { get } = useRest<T>("", { delay: 1 })

	const [ values, actions ] = useMap<string, T | undefined>()

	return (id: string, request: boolean = true) => {
		if(values.has(id)) return values.get(id)
		if(!request) return undefined

		actions.set(id, undefined)
		get({ path: `/${ id.split(":")[0].toLowerCase() }s/${ id.split(":")[1] }`, onSuccess: data => actions.set(id, data) })
	}
}