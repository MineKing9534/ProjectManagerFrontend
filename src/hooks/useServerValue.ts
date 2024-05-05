import { useState } from "react";
import { useEvent } from "./useEvent.ts";

export function useServerValue<T>(event: string, initialValue: T, onUpdate?: () => void) {
	const [ state, setState ] = useState(initialValue)

	useEvent(event, data => {
		setState(data as T)
		onUpdate && onUpdate()
	})

	return state
}