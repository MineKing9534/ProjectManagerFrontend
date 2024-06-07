import { EventSourceContext } from "../hooks/useEvent.ts";
import { useToken } from "../hooks/useToken.ts";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import { useNavigate } from "react-router"

export default function EventProvider({ route, children }: { route: string, children?: ReactNode }) {
	const navigate = useNavigate()

	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
	const { token } = useToken()

	const [ v, update ] = useState(0)
	const ref = useRef<WebSocket>()
	const [ event, setEvent ] = useState<CloseEvent>()

	const source = useMemo(() => {
		const ws = new WebSocket(`${ import.meta.env._WS }${ route }?token=${ token }`)
		ws.onclose = event => {
			if(event.reason === "leave") return

			setEvent(event)
			onOpen()
		}

		if(ref.current?.OPEN) ref.current?.close(1000, "leave")
		return ws
	}, [ route, token, v ])

	ref.current = source

	useEffect(() => {
		return () => source.close()
	}, [ source ]);

	return (
		<>
			<EventSourceContext.Provider value={ source }>
				{ children }
			</EventSourceContext.Provider>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } onClose={ () => navigate("/") }>
				<ModalContent>
					<ModalHeader className="py-2">Verbindung getrennt</ModalHeader>
					<Divider/>

					<ModalBody>
						{ event?.reason
							? <>Verbindung konnte nicht hergestellt werden: <b className="text-danger">{ event.reason }</b></>
							: <>Die Verbindung zum Server wurde Unterbrochen</>
						}
					</ModalBody>

					<Divider/>
					<ModalFooter className="p-2">
						<Button color="primary" size="sm" onPress={ () => {
							update(x => x + 1)
							onClose()
						} }>Erneut Verbinden</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}