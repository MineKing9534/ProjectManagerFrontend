import { useUserRequest } from "../../hooks/useUser.ts"
import { Outlet, useLocation, useNavigate } from "react-router"
import { CircularProgress } from "@nextui-org/react"
import ErrorModal from "../../components/ErrorModal.tsx"

export default function AccountLayout() {
	const { pathname } = useLocation()
	const navigate = useNavigate()

	const { state, data, error } = useUserRequest()!

	if(state === "loading" && !data) return <CircularProgress className="m-auto" aria-label="Lade Nutzer"/>
	return (
		<>
			{ data ? <Outlet/> :
				<ErrorModal error={ error! } isOpen onOpenChange={ () => {} } onClose={ () => navigate("/", { state: pathname }) }/>
			}
		</>
	)
}