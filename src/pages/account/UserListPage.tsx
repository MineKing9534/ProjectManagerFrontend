import { useRest } from "../../hooks/useRest.ts"
import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, CheckboxGroup, Chip, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@nextui-org/react"
import ErrorModal from "../../components/ErrorModal.tsx"
import { useEffect, useRef, useState } from "react"
import { User } from "../../types/User.ts"
import Spinner from "../../components/Spinner.tsx"
import { Eye, FolderInput, Trash2 } from "lucide-react"
import { Skill } from "../../types/Skill.ts"
import Download from "../../components/Download.tsx"
import { useSearchParams } from "react-router-dom"
import { PaginationResult } from "../../types/PaginationResult.ts"
import BackButton from "../../components/BackButton.tsx"
import { Resource } from "../../types/Identifiable.ts"

export default function UserListPage() {
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const download = useRef<(url: string) => void>(null)

	const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure()
	const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange, onClose: onDeleteClose } = useDisclosure()
	const [ current, setCurrent ] = useState<User>()

	const [ searchParams, setSearchParams ] = useSearchParams()
	const parent = searchParams.get("parent")

	const [ page, setPage ] = useState(1)
	const { state, data, error, get } = useRest<PaginationResult<User>>(parent ? `/${ parent }/members/users?page=${ page }` : `/users?page=${  page }`, {
		auto: true,
		onError: onErrorOpen
	})

	const { data: parentResource, get: getParent } = useRest<Resource>(`/${ parent }`)

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

	useEffect(() => {
		setPage(1)
		getParent()
	}, [ parent ])

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">{ parent && <BackButton location={ `/@me/${ parent }` }/> } Nutzer Liste { parentResource && <>({ parentResource.name })</> }</CardHeader>
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
						isLoading={ state === "loading" } loadingContent={ <Spinner/> }
						items={ data?.data || [] } emptyContent="Keine Nutzer"
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

			<CardFooter className="py-2 flex-shrink-0 grid grid-cols-3">
				{ parent ? <Button size="sm" className="w-fit" onPress={ () => setSearchParams([]) }>Alle Anzeigen</Button> : <span/> }
				{ (data?.total || 1) > 1 ? <Pagination
					aria-label="Seitenauswahl" isCompact showControls className="mx-auto"
					page={ page } total={ data?.total || 1 } onChange={ (page) => setPage(page) }
				/> : <span/> }
				<Button size="sm" color="primary" className="w-fit ml-auto font-bold" onPress={ () => download.current && download.current(`${ import.meta.env._API }/users/csv${ parent ? `?parent=${ parent }` : "" }`) } startContent={ <FolderInput strokeWidth="2.5px" height="20px"/> }>Exportieren</Button>
			</CardFooter>

			<ErrorModal error={ error! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>

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