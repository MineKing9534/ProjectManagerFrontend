import { useRest } from "../../../../hooks/useRest.ts"
import { useNavigate } from "react-router"
import { useUser } from "../../../../hooks/useUser.ts"
import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, Selection, SelectItem, useDisclosure } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { Resource } from "../../../../types/Identifiable.ts"
import { useState } from "react"
import { DateValue, getLocalTimeZone, now } from "@internationalized/date"
import { useDateFormatter } from "@react-aria/i18n"
import { PaginationResult } from "../../../../types/PaginationResult.ts"
import { Meeting } from "../../../../types/Meeting.ts"
import BackButton from "../../../../components/BackButton.tsx"
import { Box, Clock, File, MapPin, PencilLine, Plus, Ticket } from "lucide-react"
import MeetingTypeBadge from "./MeetingTypeBadge.tsx"
import Spinner from "../../../../components/Spinner.tsx"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useResourceCache } from "../../../../hooks/useResourceCache.ts"

export default function MeetingList({ parent }: { parent?: Resource }) {
	const navigate = useNavigate()
	const user = useUser()!

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const getResource = useResourceCache()

	const { state: createState, error: createError, post } = useRest<Meeting>(`/${ parent?.resourceType.toLowerCase() }s/${ parent?.id }/meetings`, {
		onSuccess: data => navigate(`/@me/meetings/${ data.id }${ parent ? "?parent" : "" }`),
		onError: onErrorOpen
	})

	const [ name, setName ] = useState("")
	const [ time, setTime ] = useState<DateValue>()
	const [ location, setLocation ] = useState("")
	const [ type, setType ] = useState<Selection>(new Set([]))

	const formatter = useDateFormatter({ dateStyle: "long", timeStyle: "short" })

	const [ page, setPage ] = useState(1)
	const { state, data, error } = useRest<PaginationResult<Meeting>>(`${ parent ? `/${ parent?.resourceType.toLowerCase() }s/${ parent?.id }` : !user.admin ? "/users/@me" : "" }/meetings?page=${ page }&entriesPerPage=5`, {
		auto: true,
		onError: onErrorOpen
	})

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">
				<BackButton/>
				Anstehende Veranstaltungen
				{ parent && <> ({ parent.name })</> }
			</CardHeader>
			<Divider/>
			<CardBody className="gap-4">
				{ state === "loading" && <CircularProgress aria-label="Lade Veranstaltungen" className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"/> }
				{ (data && !data.data.length) && <span className="text-foreground-400 mx-auto mt-20">Keine Veranstaltungen</span> }
				{ data && data.data.map(meeting =>
					<Card key={ meeting.id } className="bg-default-100 hover:mx-[-5px] !transition-[margin]" as={ Link } to={ `/@me/meetings/${ meeting.id }${ parent ? "?parent" : "" }` }>
						<CardHeader className="font-bold text-lg gap-2 py-2">
							{ meeting.parent.includes(meeting.id) ? <Box/> : <Ticket/> }
							{ meeting.name }
							<MeetingTypeBadge type={ meeting.type } className="absolute right-3"/>
						</CardHeader>
						<Divider/>
						<CardBody className="gap-3">
							{ (!parent && !meeting.parent.includes(meeting.id)) && <span className="flex gap-2 rounded-lg bg-default-200 p-1"><Box width="20px"/> { getResource(meeting.parent) ? getResource(meeting.parent)?.name : <i>Laden...</i> }</span> }
							<span className="flex gap-2 bg-default-200 rounded-lg p-1"><MapPin width="20px"/> { meeting.location }</span>
							<span className="flex gap-2 bg-default-200 rounded-lg p-1"><Clock width="20px"/> { formatter.format(new Date(meeting.time)) }</span>
						</CardBody>
					</Card>
				) }
			</CardBody>

			<CardFooter className="flex-col gap-2 flex-shrink-0">
				{ (data?.total || 1) > 1 && <div className="w-full flex justify-center">
					<Pagination
						aria-label="Seitenauswahl" isCompact showControls
						page={ page } total={ data?.total || 1 } onChange={ (page) => setPage(page) }
					/>
				</div> }

				<div className="w-full flex gap-2 justify-between flex-wrap">
					{ parent && <Button size="sm" className="flex-grow sm:flex-grow-0" as={ Link } to="/@me/meetings">Alle Anzeigen</Button> }

					<span className="hidden sm:block sm:flex-grow"/>

					{ (parent && user.admin) && <Button size="sm" color="primary" className="flex-grow sm:flex-grow-0" onPress={ () => {
						setName("")
						setTime(now(getLocalTimeZone()).add({ weeks: 1 }))
						setLocation("")
						setType(new Set([ "MEETING" ]))

						onOpen()
					} } startContent={ <Plus height="20px" strokeWidth="2.5px"/> }>Erstellen</Button> }
				</div>
			</CardFooter>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Veranstaltung Erstellen</ModalHeader>
					<Divider/>
					<form onSubmit={ event => {
						event.preventDefault()
						post({
							data: {
								name,
								location,
								type: [ ...type ][0],
								time: time?.toDate(getLocalTimeZone()).toISOString()
							}
						})
					} }>
						<ModalBody className="pt-5 pb-0">
							<Input
								value={ name } onValueChange={ setName } isDisabled={ createState === "loading" }
								type="text" minLength={ 3 } isRequired
								label="Name" placeholder="Veranstaltung"
								classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
								startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							<Input
								value={ location } onValueChange={ setLocation } isDisabled={ createState === "loading" }
								type="text" minLength={ 3 } isRequired
								label="Ort" placeholder="Wie Üblich"
								classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
								startContent={ <MapPin height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							<DatePicker
								value={ time } onChange={ setTime } isDisabled={ createState === "loading" }
								isRequired label="Zeit" hideTimeZone minValue={ now(getLocalTimeZone()) }
								startContent={ <Clock height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							<Select
								selectedKeys={ type } onSelectionChange={ s => [ ...s ].length && setType(s) } isDisabled={ createState === "loading" }
								isRequired label="Typ"
								startContent={ <File height="15px" strokeWidth="3" className="text-default-500"/> }
							>
								<SelectItem key="MEETING">Treffen</SelectItem>
								<SelectItem key="PRACTICE">Übung</SelectItem>
								<SelectItem key="EVENT">Veranstaltung</SelectItem>
							</Select>
						</ModalBody>
						<ModalFooter>
							<Button type="submit" isLoading={ createState === "loading" } spinner={ <Spinner/> } isDisabled={ name.length < 2 || location.length < 2 } className="font-bold" size="sm" color="primary">Erstellen</Button>
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>

			<ErrorModal error={ (error || createError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => error && navigate("/@me") }/>
		</Card>
	)
}