import { useUserRequest } from "../../hooks/useUser.ts"
import { Outlet, useLocation, useNavigate } from "react-router"
import { CircularProgress, Divider, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"

export default function AccountLayout() {
	const { pathname } = useLocation()
	const navigate = useNavigate()

	const { state, data } = useUserRequest()!

	if(state === "loading") return <CircularProgress className="m-auto" aria-label="Lade Nutzer"/>
	return (
		<>
			{ data ? <Outlet/> :
				<Modal isOpen onClose={ () => navigate("/", { state: pathname }) }>
					<ModalContent>
						<ModalHeader className="py-2 text-danger">Fehler</ModalHeader>
						<Divider/>
						<ModalBody className="py-5">
							Sie sind nicht angemeldet! Melden Sie sich zunächst an, bevor Sie diese Seite verwenden können!
						</ModalBody>
					</ModalContent>
				</Modal>
			}
		</>
	)
}