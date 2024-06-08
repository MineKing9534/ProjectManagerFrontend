import { useLocation } from "react-router"
import { MoveLeft } from "lucide-react"
import { Link } from "react-router-dom"

export default function BackButton({ location }: { location?: string | boolean }) {
	const { pathname } = useLocation()

	console.log(pathname, pathname.match(/(.*)\//))

	return (
		<Link className="hidden md:block hover:translate-x-2 transition absolute left-3 hover:bg-default-100 rounded-full p-2" to={ typeof location === "string" ? location : pathname.match(/(.*)\//)![1] || "/" }>
			<MoveLeft/>
		</Link>
	)
}