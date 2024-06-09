import { useRest } from "../../../../hooks/useRest.ts"
import { useNavigate } from "react-router"
import { useUser } from "../../../../hooks/useUser.ts"
import { Button, Card, CardBody, CardFooter, CardHeader, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { Resource } from "../../../../types/Identifiable.ts"
import { ReactNode, useState } from "react"
import { DateValue, getLocalTimeZone, now } from "@internationalized/date"
import { useDateFormatter } from "@react-aria/i18n"
import { PaginationResult } from "../../../../types/PaginationResult.ts"
import BackButton from "../../../../components/BackButton.tsx"
import { Clock, MapPin, PencilLine, Plus } from "lucide-react"
import Spinner from "../../../../components/Spinner.tsx"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { Project } from "../../../../types/Project.ts"
import { Meeting } from "../../../../types/Meeting.ts"

export default function ProjectList({ parent }: { parent?: Resource }) {
	const navigate = useNavigate()
	const user = useUser()!

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state: createState, error: createError, post } = useRest<Project>(`${ parent ? `/${ parent.resourceType.toLowerCase() }s/${ parent.id }` : "" }/projects`, {
		onSuccess: data => navigate(`/@me/projects/${ data.id }${ parent ? "?parent" : "" }`),
		onError: onErrorOpen
	})

	const [ name, setName ] = useState("")
	const [ time, setTime ] = useState<DateValue>()
	const [ location, setLocation ] = useState("")

	const formatter = useDateFormatter({ dateStyle: "long", timeStyle: "short" })

	const [ page, setPage ] = useState(1)
	const { state, data, error } = useRest<PaginationResult<Project>>(`${ parent ? `/${ parent?.resourceType.toLowerCase() }s/${ parent?.id }` : !user.admin ? "/users/@me" : "" }/projects?page=${ page }&entriesPerPage=5`, {
		auto: true,
		onError: onErrorOpen
	})

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">
				<BackButton/>
				Projekte
				{ parent && <span className="text-default-500 ml-2">{ parent.name }</span> }
			</CardHeader>
			<Divider/>
			<CardBody className="gap-4">
				<Table isHeaderSticky removeWrapper aria-label="Projekt Liste" selectionMode="single" className="h-full">
					<TableHeader>
						<TableColumn key="name">Name</TableColumn>
						<TableColumn key="time" align="end" className="w-[100px]">Zeitpunkt</TableColumn>
					</TableHeader>

					<TableBody
						isLoading={ state === "loading" } loadingContent={ <Spinner/> }
						items={ data?.data || [] } emptyContent="Keine Projekte"
					>
						{ project => (
							<TableRow key={ project.id }>
								<TableCell className="whitespace-nowrap"><Link to={ `/@me/projects/${ project.id }` } className="block w-full h-full">{ project.name }</Link></TableCell>
								<TableCell className="whitespace-nowrap">
									<ProjectMeeting project={ project }>
										{ meeting => formatter.format(new Date(meeting.time)) }
									</ProjectMeeting>
								</TableCell>
							</TableRow>
						) }
					</TableBody>
				</Table>
			</CardBody>

			<CardFooter className="flex-col gap-2 flex-shrink-0">
				{ (data?.totalPages || 1) > 1 && <div className="w-full flex justify-center">
					<Pagination
						aria-label="Seitenauswahl" isCompact showControls
						page={ page } total={ data?.totalPages || 1 } onChange={ (page) => setPage(page) }
					/>
					<span className="text-default-500 font-bold hidden md:block absolute right-3">Insgesamt { data?.totalEntries } Einträge</span>
				</div> }

				<div className="w-full flex gap-2 justify-between flex-wrap">
					{ parent && <Button size="sm" className="flex-grow sm:flex-grow-0" as={ Link } to="/@me/projects">Alle Anzeigen</Button> }

					<span className="hidden sm:block sm:flex-grow"/>

					{ user.admin && <Button size="sm" color="primary" className="flex-grow sm:flex-grow-0" onPress={ () => {
						setName("")
						setTime(now(getLocalTimeZone()).add({ weeks: 1 }))
						setLocation("")

						onOpen()
					} } startContent={ <Plus height="20px" strokeWidth="2.5px"/> }>Erstellen</Button> }
				</div>
			</CardFooter>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Projekt Erstellen { parent && <> (in { parent.name })</> }</ModalHeader>
					<Divider/>
					<form onSubmit={ event => {
						event.preventDefault()
						post({
							data: {
								name,
								location,
								time: time?.toDate(getLocalTimeZone()).toISOString()
							}
						})
					} }>
						<ModalBody className="pt-5 pb-0">
							<Input
								value={ name } onValueChange={ setName } isDisabled={ createState === "loading" }
								type="text" minLength={ 3 } isRequired
								label="Name" placeholder="Projekt"
								classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
								startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							<h2 className="font-bold text-lg">Einstellungen zur Veranstaltung</h2>

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

function ProjectMeeting({ project, children }: { project: Project, children: (meeting: Meeting) => ReactNode }) {
	const { state, data } = useRest<Meeting>(`/meetings/${ project.id }`, { auto: true })

	return (
		<>
			{ state === "loading" && <i>Laden...</i> }
			{ state === "error" && <span className="text-danger">Fehler</span> }
			{ state === "success" && <span>{ children(data!) }</span> }
		</>
	)
}