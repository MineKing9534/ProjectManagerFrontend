import { Button, Card, CardBody, CardFooter, CardHeader, Chip, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, Selection, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import { Link, useSearchParams } from "react-router-dom"
import { useState } from "react"
import { useRest } from "../../../../hooks/useRest.ts"
import Spinner from "../../../../components/Spinner.tsx"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useUser } from "../../../../hooks/useUser.ts"
import { useNavigate } from "react-router"
import { Meeting } from "../../../../types/Meeting.ts"
import { Clock, File, MapPin, PencilLine, Plus } from "lucide-react"
import { useDateFormatter } from "@react-aria/i18n"
import { DateValue, getLocalTimeZone, now } from "@internationalized/date"
import { PaginationResult } from "../../../../types/PaginationResult.ts"
import BackButton from "../../../../components/BackButton.tsx"

export default function MeetingListPage() {
	const navigate = useNavigate()
	const user = useUser()!

	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const [ searchParams ] = useSearchParams()
	const parent = searchParams.get("parent")

	const { state: createState, error: createError, post } = useRest("/meetings", {
		onSuccess: () => {
			onClose()
			get()
		},
		onError: onErrorOpen
	})

	const [ name, setName ] = useState("")
	const [ time, setTime ] = useState<DateValue>()
	const [ location, setLocation ] = useState("")
	const [ type, setType ] = useState<Selection>(new Set([]))

	const formatter = useDateFormatter({ dateStyle: "long", timeStyle: "short" })

	const [ page, setPage ] = useState(1)
	const { state, data, error, get } = useRest<PaginationResult<Meeting>>(user.admin ? `/meetings?page=${ page }` : `/users/@me/meetings?page=${ page }`, {
		auto: true,
		onError: onErrorOpen
	})

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">{ parent && <BackButton location={ `/@me/${ parent }` }/> } Treffen Liste</CardHeader>
			<Divider/>
			<CardBody>
				<Table isHeaderSticky removeWrapper aria-label="Treffen Liste" selectionMode="single">
					<TableHeader>
						<TableColumn key="name">Name</TableColumn>
						<TableColumn key="location">Ort</TableColumn>
						<TableColumn key="time" align="end" className="w-[200px]">Zeit</TableColumn>
						<TableColumn key="type" align="end" className="w-[150px]">Typ</TableColumn>
					</TableHeader>

					<TableBody
						isLoading={ state === "loading" } loadingContent={ <Spinner/> }
						items={ data?.data || [] } emptyContent="Keine Treffen"
					>
						{ meeting => (
							<TableRow key={ meeting.id }>
								<TableCell><Link to={ `/@me/meetings/${ meeting.id }` } className="block w-full h-full">{ meeting.name }</Link></TableCell>
								<TableCell>{ meeting.location }</TableCell>
								<TableCell>{ formatter.format(new Date(meeting.time)) }</TableCell>
								<TableCell><Chip color={ meeting.type === "MEETING" ? "warning" : meeting.type === "PRACTICE" ? "success" : "primary" }>{ meeting.type === "MEETING" ? "Treffen" : meeting.type === "PRACTICE" ? "Übung" : "Veranstaltung" }</Chip></TableCell>
							</TableRow>
						) }
					</TableBody>
				</Table>
			</CardBody>

			<CardFooter className="justify-between py-2 flex-shrink-0">
				<span/>
				{ (data?.total || 1) > 1 && <Pagination
					aria-label="Seitenauswahl" isCompact showControls
					page={ page } total={ data?.total || 1 } onChange={ (page) => setPage(page) }
				/> }
				<Button size="sm" className="hover:bg-primary" onPress={ () => {
					setName("")
					setTime(now(getLocalTimeZone()).add({ weeks: 1 }))
					setLocation("")
					setType(new Set([ "MEETING" ]))

					onOpen()
				} } isIconOnly><Plus/></Button>
			</CardFooter>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">Treffen Erstellen</ModalHeader>
					<Divider/>
					<form onSubmit={ event => {
						event.preventDefault()
						post({ data: {
							name,
							location,
							type: [ ...type ][0],
							time: time?.toDate(getLocalTimeZone()).toISOString()
						} })
					} }>
						<ModalBody className="pt-5 pb-0">
							<Input
								value={ name } onValueChange={ setName } isDisabled={ createState === "loading" }
								type="text" autoComplete="given-name" minLength={ 3 } isRequired
								label="Name" placeholder="Treffen"
								classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
								startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							<Input
								value={ location } onValueChange={ setLocation } isDisabled={ createState === "loading" }
								type="text" autoComplete="given-name" minLength={ 3 } isRequired
								label="Name" placeholder="Wie Üblich"
								classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
								startContent={ <MapPin height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							<DatePicker
								value={ time } onChange={ setTime } isDisabled={ createState === "loading" }
								isRequired label="Zeit" hideTimeZone minValue={ now(getLocalTimeZone()) }
								startContent={ <Clock height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							<Select
								selectedKeys={ type } onSelectionChange={ setType } isDisabled={ createState === "loading" }
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