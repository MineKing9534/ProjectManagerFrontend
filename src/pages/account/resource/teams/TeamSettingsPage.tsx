import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, Selection, SelectItem, Spacer, useDisclosure } from "@nextui-org/react"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useParams } from "react-router-dom"
import { useRest } from "../../../../hooks/useRest.ts"
import { Team } from "../../../../types/Team.ts"
import { useNavigate } from "react-router"
import Spinner from "../../../../components/Spinner.tsx"
import { File, PencilLine, Save, Trash2 } from "lucide-react"
import { useState } from "react"
import BackButton from "../../../../components/BackButton.tsx"

export default function TeamSettingsPage() {
	const navigate = useNavigate()

	const params = useParams()
	const id = params.id

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { data: teams } = useRest<Team[]>("/teams", { auto: true })

	const { data, error, get } = useRest<Team>(`/teams/${ id }`, {
		auto: true,
		onError: onErrorOpen,
		onSuccess: data => {
			setName(data.name)
			setParent(new Set([ data.parent.split(":")[1] || "" ]))
		}
	})

	const { state: editState, error: editError, patch, del } = useRest(`/teams/${ id }`, {
		onError: onErrorOpen,
		onSuccess: result => result ? get() : navigate("/@me/teams")
	})

	const [ name, setName ] = useState("")
	const [ parent, setParent ] = useState<Selection>(new Set([ "" ]))

	function update() {
		patch({
			data: {
				name,
				parent: [ ...parent ][0]
			}
		})
	}

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center"><BackButton/> { data?.name } Bearbeiten</CardHeader>
			<Divider/>
			<CardBody className="gap-3">
				{ !data && <CircularProgress aria-label="Lade" className="m-auto"/> }
				{ data && <>
					<Input
						value={ name } onValueChange={ setName } isDisabled={ editState === "loading" }
						type="text" autoComplete="given-name" minLength={ 3 } isRequired
						label="Name" placeholder="Team"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
					/>

					{ teams && <Select
						selectedKeys={ parent } onSelectionChange={ s => [ ...s ].length && setParent(s) } isDisabled={ editState === "loading" }
						label="Gehört zu"
						startContent={ <File height="15px" strokeWidth="3" className="text-default-500"/> }
					>
						{ [ ...teams.filter(t => t.id !== data.id).map(team => (
							<SelectItem key={ team.id }>{ team.name }</SelectItem>
						)), <SelectItem key="" textValue="Kein Team"><i>Kein Team</i></SelectItem> ] }
					</Select> }
				</> }
			</CardBody>
			<Divider/>
			<CardFooter className="flex w-full justify-between py-2">
				<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ onOpen }>Löschen</Button>
				{ ((name !== data?.name && name.length >= 3) || [ ...parent ][0] !== data?.parent?.substring("TEAM:".length)) && <Button size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Save strokeWidth="2.5px" height="20px"/> } onPress={ update }>Speichern</Button> }
			</CardFooter>

			<ErrorModal error={ (error || editError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => error && navigate("/@me/teams") }/>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } size="xl">
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">{ data?.name } Löschen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Team <b>{ data?.name }</b> wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!

						<Spacer className="h-5"/>

						<div color="warning" className="text-warning bg-warning/20 p-4 rounded-large text-justify">
							<h3 className="font-bold text-lg mb-1">Hinweis</h3>
							Durch das löschen des Teams werden auch alle anderen zugehörigen Teams und Projekte gelöscht.
							Wenn dieses Verhalten nicht erwünscht ist, sollte die Verbindung von Teams und Projekten, die erhalten bleiben sollen, zunächst aufgelöst werden.
						</div>
					</ModalBody>
					<ModalFooter className="p-2">
						<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ () => del() }>Löschen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Card>
	)
}