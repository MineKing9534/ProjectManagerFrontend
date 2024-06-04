import { useLocation, useNavigate } from "react-router"
import { MoveLeft } from "lucide-react"

export default function BackButton() {
	const navigate = useNavigate()
	const { pathname } = useLocation()

	return (
		<button className="hover:translate-x-2 transition absolute left-3 hover:bg-default-100 rounded-full p-2" onClick={ () => navigate(pathname.match(/(.*)\//)![1]) }>
			<MoveLeft/>
		</button>
	)
}