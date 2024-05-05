import { nextui } from "@nextui-org/react"

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			colors: {
				primary: "#007bff",
				danger: "#ff0202"
			},
			screens: {
				"h-md": { "raw": "(height >= 650px)" },
				"h-lg": { "raw": "(height >= 800px)" }
			}
		}
	},
	darkMode: "class",
	plugins: [
		nextui({
			addCommonColors: true,
			themes: {
				dark: {
					colors: {
						background: "#0c0c0c"
					}
				}
			}
		})
	]
}
