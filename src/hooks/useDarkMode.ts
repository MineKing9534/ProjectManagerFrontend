import { useLocalStorage } from "usehooks-ts";

export function useDarkMode() {
	const [ darkMode, setDarkMode ] = useLocalStorage<boolean>("darkmode", true)

	return {
		darkMode: darkMode,
		setDarkMode: (state: boolean) => setDarkMode(state)
	}
}