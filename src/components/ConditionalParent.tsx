import { ReactNode } from "react"

export default function ConditionalParent({ condition, parent, children }: { condition: boolean, parent: (children: ReactNode) => ReactNode, children: ReactNode }) {
	return condition ? parent(children) : children
}