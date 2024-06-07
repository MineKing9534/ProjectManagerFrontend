import { useRest } from "../../hooks/useRest.ts"
import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, CheckboxGroup, Chip, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@nextui-org/react"
import ErrorModal from "../../components/ErrorModal.tsx"
import { useEffect, useRef, useState } from "react"
import { User } from "../../types/User.ts"
import Spinner from "../../components/Spinner.tsx"
import { FolderInput, Pencil, Trash2 } from "lucide-react"
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
	const { state, data, error, get } = useRest<PaginationResult<User>>(parent ? `/${ parent }/users?page=${ page }` : `/users?page=${  page }`, {
		auto: true,
		onError: onErrorOpen
	})

	const { data: parentResource, get: getParent } = useRest<Resource>(`/${ parent }`, {
		condition: () => !!parent
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
			current!.skills = data
			get()
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
				<Table isHeaderSticky removeWrapper aria-label="Nutzer Liste" selectionMode="single" className="h-full table-fixed">
					<TableHeader>
						<TableColumn key="name">Name</TableColumn>
						<TableColumn key="email">Email</TableColumn>
						<TableColumn key="role" align="end" className="w-[120px]">Rolle</TableColumn>
						<TableColumn key="actions" align="end" className="w-[100px]">Aktionen</TableColumn>
					</TableHeader>

					<TableBody
						isLoading={ state === "loading" } loadingContent={ <Spinner/> }
						items={ data?.data || [] } emptyContent="Keine Nutzer"
					>
						{ user => (
							<TableRow key={ user.id }>
								<TableCell><span className="whitespace-nowrap">{ user.firstName } { user.lastName }</span></TableCell>
								<TableCell><a className="whitespace-nowrap" href={ `mailto:${ user.email }` }>{ user.email }</a></TableCell>
								<TableCell><Chip variant="flat" color={ user.admin ? "success" : "primary" }>{ user.admin ? "Admin" : "Nutzer" }</Chip></TableCell>
								<TableCell>
									<span className="relative flex items-center gap-2">
										<Tooltip content="Fähigkeiten bearbeiten" closeDelay={ 0 }>
											<button className="text-lg text-default-400 hover:opacity-70" onClick={ () => {
												setCurrent(user)
												onDetailsOpen()
											} }>
												<Pencil height="20px"/>
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
									</span>
								</TableCell>
							</TableRow>
						) }
					</TableBody>
				</Table>
			</CardBody>

			<CardFooter className="flex-col gap-2 flex-shrink-0">
				{ (data?.total || 1) > 1 && <div className="w-full flex justify-center">
					<Pagination
						aria-label="Seitenauswahl" isCompact showControls
						page={ page } total={ data?.total || 1 } onChange={ (page) => setPage(page) }
					/>
				</div> }

				<div className="w-full flex gap-2 justify-between flex-wrap">
					{ parent && <Button size="sm" className="flex-grow sm:flex-grow-0" onPress={ () => setSearchParams([]) }>Alle Anzeigen</Button> }

					<span className="hidden sm:block sm:flex-grow"/>

					{ !!data?.data.length && <Button size="sm" color="primary" className="flex-grow sm:flex-grow-0 font-bold" onPress={ () => download.current && download.current(`${ import.meta.env._API }${ parent ? `/${ parent }` : "" }/users/csv`) } startContent={ <FolderInput strokeWidth="2.5px" height="20px"/> }>Exportieren</Button> }
				</div>
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