import Download from "./Download.tsx"
import { useEffect, useRef } from "react"
import { Resource } from "../types/Identifiable.ts"
import { useDarkMode } from "../hooks/useDarkMode.ts"

export default function FileDisplay({ resource, file, className, contentClassName }: { resource: Resource, file: string, className?: string, contentClassName?: string }) {
	const { darkMode } = useDarkMode()

	const download = useRef<(url: string) => void>(null)
	const iframe = useRef<HTMLIFrameElement>(null)

	useEffect(() => {
		download.current!(`${ import.meta.env._API }/${ resource.resourceType.toLowerCase() }s/${ resource.id }/files/${ file }`)
	}, [])

	useEffect(() => {
		const content = iframe.current!.contentDocument!
		if(!content) return

		if(darkMode) content.body.classList.add("dark")
		else content.body.classList.remove("dark")
	}, [ darkMode, iframe ])

	return (
		<>
			<iframe name="info" className={ `${ className ? className : "" } border-none outline-none` } ref={ iframe } onLoad={ env => {
				const content = (env.target as never as { contentDocument: Document }).contentDocument
				if(!content) return

				document.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]").forEach(link => {
					const style = document.createElement("link")

					style.rel = link.rel
					style.href = link.href

					content.head.appendChild(style)
				})

				content.body.className += `${ darkMode ? "dark" : "" } text-foreground bg-background max-w-full min-h-screen overflow-hidden ${ contentClassName ? contentClassName : "" }`
			} }/>
			<Download ref={ download } target="info"/>
		</>
	)
}