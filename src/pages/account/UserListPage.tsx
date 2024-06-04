import { useRest } from "../../hooks/useRest.ts"
import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, CheckboxGroup, Chip, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@nextui-org/react"
import ErrorModal from "../../components/ErrorModal.tsx"
import { useEffect, useMemo, useRef, useState } from "react"
import { chunk } from "../../utils/chunk.ts"
import { User } from "../../types/User.ts"
import Spinner from "../../components/Spinner.tsx"
import { Eye, FolderInput, Trash2 } from "lucide-react"
import { Skill } from "../../types/Skill.ts"
import Download from "../../components/Download.tsx"
import { useSearchParams } from "react-router-dom"

const pageSize = 15

export default function UserListPage() {
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const download = useRef<(url: string) => void>(null)

	const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure()
	const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange, onClose: onDeleteClose } = useDisclosure()
	const [ current, setCurrent ] = useState<User>()

	const [ searchParams, setSearchParams ] = useSearchParams()
	const parent = searchParams.get("parent")

	const { data, error, get } = useRest<string[]>(parent ? `/users?parent=${ parent }` : "/users", {
		auto: true,
		onError: onErrorOpen
	})

	const { data: skills } = useRest<Skill[]>("/skills", { auto: true })
	const { state: deleteState, del } = useRest(`/users/${ current?.id }`, {
		onSuccess: () => {
			get()
			onDeleteClose()
		}
	})
	const { state: skillState, put } = useRest<string[]>(`/users/${ current?.id }/skills`, {
		onSuccess: data => {
			if(current) current.skills = data
		}
	})

	const chunks = useMemo(() => data ? chunk(data, pageSize) : [], [ data ])
	const [ users, setUsers ] = useState<User[]>([])

	const [ page, setPage ] = useState(1)

	const { state: chunkState, error: chunkError, post: resolve } = useRest<User[]>("/users/resolve", { onSuccess: setUsers })

	function load() {
		const chunk = chunks[page - 1]
		if(chunk) resolve({ data: { ids: chunk } })
	}

	useEffect(() => {
		if(page > chunks.length && chunks.length) setPage(chunks.length)
		load()
	}, [ page, chunks ])

	useEffect(() => {
		setPage(1)
	}, [ parent ])

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">Nutzer Liste</CardHeader>
			<Divider/>
			<CardBody>
				<Table isHeaderSticky removeWrapper aria-label="Nutzer Liste" selectionMode="single">
					<TableHeader>
						<TableColumn key="name">Name</TableColumn>
						<TableColumn key="email">Email</TableColumn>
						<TableColumn key="role" align="end" className="w-[150px]">Rolle</TableColumn>
						<TableColumn key="actions" align="end" className="w-[150px]">Aktionen</TableColumn>
					</TableHeader>

					<TableBody
						isLoading={ chunkState === "loading" } loadingContent={ <Spinner/> }
						items={ users } emptyContent="Keine Nutzer"
					>
						{ user => (
							<TableRow key={ user.id }>
								<TableCell><span>{ user.firstName } { user.lastName }</span></TableCell>
								<TableCell><a href={ `mailto:${ user.email }` }>{ user.email }</a></TableCell>
								<TableCell><Chip variant="flat" color={ user.admin ? "success" : "primary" }>{ user.admin ? "Admin" : "Nutzer" }</Chip></TableCell>
								<TableCell className="relative flex items-center gap-2 h-[44px]">
									<Tooltip content="Fähigkeiten" closeDelay={ 0 }>
										<button className="text-lg text-default-400 hover:opacity-70" onClick={ () => {
											setCurrent(user)
											onDetailsOpen()
										} }>
											<Eye height="20px"/>
										</button>
									</Tooltip>
									<Tooltip color="danger" content="Löschen" closeDelay={ 0 }>
										<button className="text-lg text-danger hover:opacity-70" onClick={ () => {
											setCurrent(user)
											onDeleteOpen()
										} }>
											<Trash2 height="20px"/>
										</button>
									</Tooltip>
								</TableCell>
							</TableRow>
						) }
					</TableBody>
				</Table>
			</CardBody>

			<CardFooter className="justify-between py-2 flex-shrink-0">
				{ parent ? 	<Button color="primary" size="sm" className="hover:bg-primary" onPress={ () => setSearchParams([]) }>Alle Anzeigen</Button> : <span/> }
				{ chunks.length > 1 && <Pagination
					aria-label="Seitenauswahl" className=""
					isCompact showControls
					page={ page } total={ chunks.length } onChange={ (page) => setPage(page) }
				/> }
				<Button size="sm" className="hover:bg-primary" onPress={ () => download.current && download.current(`${ import.meta.env._API }/users/csv${ parent ? `?parent=${ parent }` : "" }`) } isIconOnly><FolderInput/></Button>
			</CardFooter>

			<ErrorModal error={ (error || chunkError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>

			<Modal isOpen={ isDetailsOpen } onOpenChange={ onDetailsOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">{ current?.firstName } { current?.lastName }</ModalHeader>
					<Divider/>
					<ModalBody className="max-h-[80vh] overflow-auto">
						<CheckboxGroup isDisabled={ skillState === "loading" } value={ current?.skills } onValueChange={ values => put({ data: { skills: values } }) }>
							{ skills?.map(skill =>
								<Checkbox key={ skill.id } value={ skill.id }>{ skill.name }</Checkbox>
							) }
						</CheckboxGroup>
					</ModalBody>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isDeleteOpen } onOpenChange={ onDeleteOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">Konto Löschen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Konto <b>{ current?.firstName } { current?.lastName }</b> ({ current?.email }) wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!
					</ModalBody>
					<Divider/>
					<ModalFooter className="py-2">
						<Button size="sm" color="danger" variant="solid" onPress={ () => del() } isLoading={ deleteState === "loading" } spinner={ <Spinner/> }>Löschen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Download target="_blank" ref={ download }/>
		</Card>
	)
}