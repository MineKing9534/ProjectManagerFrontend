import { ReactNode } from "react"
import { Modal, ModalContent, useDisclosure } from "@nextui-org/react"
import { useEvent } from "../hooks/useEvent.ts"

export default function EventModal({ event, onClose, children, dismissable = true }: { event: string, onClose?: () => void, children: ReactNode | ((onClose: () => void) => ReactNode), dismissable?: boolean }) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	useEvent(event, onOpen)

	return (
		<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } onClose={ onClose } isDismissable={ dismissable }>
			<ModalContent>
				{ children }
			</ModalContent>
		</Modal>
	)
}