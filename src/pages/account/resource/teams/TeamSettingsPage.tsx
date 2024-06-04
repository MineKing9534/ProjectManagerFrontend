import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useParams } from "react-router-dom"
import { useRest } from "../../../../hooks/useRest.ts"
import { Team } from "../../../../types/Team.ts"
import { useNavigate } from "react-router"
import Spinner from "../../../../components/Spinner.tsx"
import { PencilLine, Save, Trash2 } from "lucide-react"
import { useState } from "react"
import BackButton from "../../../../components/BackButton.tsx"

export default function TeamSettingsPage() {
	const navigate = useNavigate()

	const params = useParams()
	const id = params.id

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { data, error, get } = useRest<Team>(`/teams/${ id }`, {
		auto: true,
		onError: onErrorOpen,
		onSuccess: data => {
			setName(data.name)
		}
	})

	const { state: editState, error: editError, patch, del } = useRest(`/teams/${ id }`, {
		onError: onErrorOpen,
		onSuccess: result => result ? get() : navigate("/@me/teams")
	})

	const [ name, setName ] = useState("")

	function update() {
		patch({
			data: {
				name
			}
		})
	}

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center"><BackButton/> { data?.name } Bearbeiten</CardHeader>
			<Divider/>
			<CardBody>
				{ !data && <CircularProgress aria-label="Lade" className="m-auto"/> }
				{ data && <>
					<Input
						value={ name } onValueChange={ setName } isDisabled={ editState === "loading" }
						type="text" autoComplete="given-name" minLength={ 3 } isRequired
						label="Name" placeholder="Team"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
					/>
				</> }
			</CardBody>
			<Divider/>
			<CardFooter className="flex w-full justify-between py-2">
				<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ onOpen }>Löschen</Button>
				{ (name !== data?.name && name.length >= 3) && <Button size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Save strokeWidth="2.5px" height="20px"/> } onPress={ update }>Speichern</Button> }
			</CardFooter>

			<ErrorModal error={ (error || editError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => error && navigate("/@me/teams") }/>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">{ data?.name } Löschen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Team <b>{ data?.name }</b> wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!
					</ModalBody>
					<ModalFooter className="p-2">
						<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ () => del() }>Löschen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Card>
	)
}