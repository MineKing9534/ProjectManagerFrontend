import { useUserRequest } from "../../hooks/useUser.ts"
import { Outlet, useLocation, useNavigate } from "react-router"
import { CircularProgress, Divider, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import ErrorDescription from "../../components/ErrorDescription.tsx"

export default function AccountLayout() {
	const { pathname } = useLocation()
	const navigate = useNavigate()

	const { state, data, error } = useUserRequest()!

	if(state === "loading" && !data) return <CircularProgress className="m-auto" aria-label="Lade Nutzer"/>
	return (
		<>
			{ data ? <Outlet/> :
				<Modal isOpen onClose={ () => navigate("/", { state: pathname }) } size="3xl">
					<ModalContent>
						<ModalHeader className="py-3 font-bold text-xl text-danger">Fehler</ModalHeader>
						<Divider/>
						<ModalBody className="py-5">
							<ErrorDescription error={ error! }/>
						</ModalBody>
					</ModalContent>
				</Modal>
			}
		</>
	)
}