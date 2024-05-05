import { ErrorResponse } from "../types/ErrorResponse.ts";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import ErrorDescription from "./ErrorDescription.tsx";

export default function ErrorModal({ error, isOpen, onOpenChange, onClose }: { error: ErrorResponse, isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onClose?: () => void }) {
	return (
		<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } onClose={ onClose }>
			<ModalContent>
				<ModalHeader className="py-3 text-danger">Fehler</ModalHeader>
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