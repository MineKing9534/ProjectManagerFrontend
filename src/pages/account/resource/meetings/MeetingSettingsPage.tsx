import { useNavigate } from "react-router"
import { useParams } from "react-router-dom"
import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, Selection, SelectItem, useDisclosure } from "@nextui-org/react"
import { useRest } from "../../../../hooks/useRest.ts"
import { useState } from "react"
import BackButton from "../../../../components/BackButton.tsx"
import { Clock, File, MapPin, PencilLine, Save, Trash2 } from "lucide-react"
import Spinner from "../../../../components/Spinner.tsx"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { DateValue, getLocalTimeZone, now, fromDate } from "@internationalized/date"
import { Meeting } from "../../../../types/Meeting.ts"

export default function MeetingSettingsPage() {
	const navigate = useNavigate()

	const params = useParams()
	const id = params.id

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { data, error, get } = useRest<Meeting>(`/meetings/${ id }`, {
		auto: true,
		onError: onErrorOpen,
		onSuccess: data => {
			setName(data.name)
			setTime(fromDate(new Date(data.time), getLocalTimeZone()))
			setLocation(data.location)
			setType(new Set([ data.type ]))
		}
	})

	const { state: editState, error: editError, patch, del } = useRest(`/meetings/${ id }`, {
		onError: onErrorOpen,
		onSuccess: result => result ? get() : navigate("/@me/meetings")
	})

	const [ name, setName ] = useState("")
	const [ time, setTime ] = useState<DateValue>()
	const [ location, setLocation ] = useState("")
	const [ type, setType ] = useState<Selection>(new Set([]))

	function update() {
		patch({
			data: {
				name,
				location,
				type: [ ...type ][0],
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
						label="Name" placeholder="Treffen"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
					/>

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

					<Select
						selectedKeys={ type } onSelectionChange={ s => [ ...s ].length && setType(s) } isDisabled={ editState === "loading" }
						isRequired label="Typ"
						startContent={ <File height="15px" strokeWidth="3" className="text-default-500"/> }
					>
						<SelectItem key="MEETING">Treffen</SelectItem>
						<SelectItem key="PRACTICE">Übung</SelectItem>
						<SelectItem key="EVENT">Veranstaltung</SelectItem>
					</Select>
				</> }
			</CardBody>
			<Divider/>
			<CardFooter className="flex w-full justify-between py-2">
				<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ onOpen }>Löschen</Button>
				{ ((name !== data?.name && name.length >= 3) || (location !== data?.location && location.length >= 3) || time?.toDate(getLocalTimeZone()).toISOString() !== data?.time || [ ...type ][0] !== data?.type) && <Button size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Save strokeWidth="2.5px" height="20px"/> } onPress={ update }>Speichern</Button> }
			</CardFooter>

			<ErrorModal error={ (error || editError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => error && navigate("/@me/teams") }/>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">{ data?.name } Löschen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Treffen <b>{ data?.name }</b> wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!
					</ModalBody>
					<ModalFooter className="p-2">
						<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ () => del() }>Löschen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Card>
	)
}