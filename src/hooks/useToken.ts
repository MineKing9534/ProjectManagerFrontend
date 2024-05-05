import { useLocalStorage } from "usehooks-ts";

export function useToken() {
	const [ token, setToken ] = useLocalStorage<string | undefined>("token", undefined)

	return {
		token: token,
		setToken: (state: string | undefined) => setToken(state)
	}
}