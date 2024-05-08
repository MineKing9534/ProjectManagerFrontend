import { useUser } from "../../hooks/useUser.ts"
import { Outlet, useLocation, useNavigate } from "react-router"
import { Divider, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"

export default function AccountLayout() {
	const { pathname } = useLocation()
	const navigate = useNavigate()
	const user = useUser()

	if(!user) return (
		<Modal isOpen onClose={ () => navigate("/", { state: pathname }) }>
			<ModalContent>
				<ModalHeader className="py-3 text-danger">Fehler</ModalHeader>
				<Divider/>
				<ModalBody>
					Sie sind nicht angemeldet! Melden Sie sich zunächst an, bevor Sie diese Seite verwenden können!
				</ModalBody>
			</ModalContent>
		</Modal>
	)

	return (
		<>
			{ user.email }
			<Outlet/>
		</>
	)
}