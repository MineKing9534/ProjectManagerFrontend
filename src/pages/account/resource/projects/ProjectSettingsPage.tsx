import { useNavigate } from "react-router"
import { useParams } from "react-router-dom"
import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, Selection, SelectItem, useDisclosure } from "@nextui-org/react"
import { useRest } from "../../../../hooks/useRest.ts"
import { useState } from "react"
import BackButton from "../../../../components/BackButton.tsx"
import { Clock, File, MapPin, PencilLine, Save, Trash2 } from "lucide-react"
import Spinner from "../../../../components/Spinner.tsx"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { DateValue, fromDate, getLocalTimeZone, now } from "@internationalized/date"
import { Meeting } from "../../../../types/Meeting.ts"
import { Team } from "../../../../types/Team.ts"
import { Project } from "../../../../types/Project.ts"

export default function ProjectSettingsPage() {
	const navigate = useNavigate()

	const params = useParams()
	const id = params.id

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { data: teams } = useRest<Team[]>("/teams", { auto: true })

	const { data: project, get: getProject } = useRest<Project>(`/projects/${ id }`, {
		auto: true,
		onSuccess: data => setParent(new Set([ data.parent.split(":")[1] || "" ]))
	})

	const { data, error, get } = useRest<Meeting>(`/meetings/${ id }`, {
		auto: true,
		onError: onErrorOpen,
		onSuccess: data => {
			setName(data.name)
			setTime(fromDate(new Date(data.time), getLocalTimeZone()))
			setLocation(data.location)
		}
	})

	const { state: editState, error: editError, patch, del } = useRest(`/projects/${ id }`, {
		onError: onErrorOpen,
		onSuccess: result => {
			if(result) {
				get()
				getProject()
			} else navigate("/@me/meetings")
		}
	})

	const [ name, setName ] = useState("")
	const [ parent, setParent ] = useState<Selection>(new Set([ "" ]))
	const [ time, setTime ] = useState<DateValue>()
	const [ location, setLocation ] = useState("")

	function update() {
		patch({
			data: {
				name,
				parent: [ ...parent ][0],
				location,
				time: time?.toDate(getLocalTimeZone()).toISOString()
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
						type="text" minLength={ 3 } isRequired
						label="Name" placeholder="Projekt"
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

					<h2 className="font-bold text-xl">Einstellungen zur Veranstaltung</h2>

					<Input
						value={ location } onValueChange={ setLocation } isDisabled={ editState === "loading" }
						type="text" minLength={ 3 } isRequired
						label="Ort" placeholder="Wie Üblich"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <MapPin height="15px" strokeWidth="3" className="text-default-500"/> }
					/>

					<DatePicker
						value={ time } onChange={ setTime } isDisabled={ editState === "loading" }
						isRequired label="Zeit" hideTimeZone minValue={ now(getLocalTimeZone()) }
						startContent={ <Clock height="15px" strokeWidth="3" className="text-default-500"/> }
					/>
				</> }
			</CardBody>
			<Divider/>
			<CardFooter className="flex w-full justify-between py-2">
				<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ onOpen }>Löschen</Button>
				{ ((name !== data?.name && name.length >= 3) || (location !== data?.location && location.length >= 3) || time?.toDate(getLocalTimeZone()).toISOString() !== data?.time || [ ...parent ][0] !== project?.parent?.substring("TEAM:".length)) &&
					<Button size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Save strokeWidth="2.5px" height="20px"/> } onPress={ update }>Speichern</Button>
				}
			</CardFooter>

			<ErrorModal error={ (error || editError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => error && navigate("/@me/projects") }/>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">{ data?.name } Löschen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Projekt <b>{ data?.name }</b> wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!
					</ModalBody>
					<ModalFooter className="p-2">
						<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ () => del() }>Löschen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Card>
	)
}