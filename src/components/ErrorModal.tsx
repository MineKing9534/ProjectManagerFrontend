import { ErrorResponse } from "../types/ErrorResponse.ts";
import { Divider, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import ErrorDescription from "./ErrorDescription.tsx";
import { useNavigate } from "react-router"
import { useToken } from "../hooks/useToken.ts"

export default function ErrorModal({ error, isOpen, onOpenChange, onClose }: { error: ErrorResponse, isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onClose?: () => void }) {
	const navigate = useNavigate()
	const { setToken } = useToken()

	return (
		<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } onClose={ () => {
			if(error.type === "TOKEN_EXPIRED") {
				setToken("")
				navigate("/")
			} else if(onClose) onClose()
		} }>
			<ModalContent>
				<ModalHeader className="py-3 font-bold text-xl text-danger">Fehler</ModalHeader>
				<Divider/>
				<ModalBody className="pb-5">
					<span className="flex gap-2">
						<span>{ error?.status }:</span>
						<span>{ error?.type }</span>
					</span>
					<span className="font-bold"><ErrorDescription error={ error! }/></span>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}