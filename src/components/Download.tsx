import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from "react";
import { useToken } from "../hooks/useToken.ts"

const Download = forwardRef<(url: string) => void, { target: string }>((props, ref) => DownloadImpl({ ...props, ref }))
export default Download

function DownloadImpl({ target, ref }: { target: string, ref: ForwardedRef<(url: string) => void> }) {
	const { token } = useToken()
	const element = useRef<HTMLFormElement>(null)

	useImperativeHandle(ref, () => (url: string) => {
		if(!element.current) return

		element.current.action = url
		element.current.innerHTML = `<input name="Authorization" value="${ token }" hidden/>`

		element.current.submit()

		element.current.innerHTML = ""
	}, [ token ])

	return (
		<form method="POST" target={ target } ref={ element } onSubmit={ () => false } hidden/>
	)
}