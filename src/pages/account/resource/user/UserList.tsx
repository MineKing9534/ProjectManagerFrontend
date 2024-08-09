import { Resource } from "../../../../types/Identifiable.ts"
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import { useRef, useState } from "react"
import { User } from "../../../../types/User.ts"
import { useRest } from "../../../../hooks/useRest.ts"
import { PaginationResult } from "../../../../types/PaginationResult.ts"
import { Skill } from "../../../../types/Skill.ts"
import BackButton from "../../../../components/BackButton.tsx"
import Spinner from "../../../../components/Spinner.tsx"
import { Eye, FolderInput, Search, Trash2, UserMinus } from "lucide-react"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import Download from "../../../../components/Download.tsx"
import { Link } from "react-router-dom"
import CustomInputList from "../../input/CustomInputList.tsx";
import SkillList from "../../SkillList.tsx";

export default function UserList({ parent }: { parent?: Resource }) {
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const download = useRef<(url: string) => void>(null)

	const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure()
	const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange, onClose: onDeleteClose } = useDisclosure()
	const { isOpen: isKickOpen, onOpen: onKickOpen, onOpenChange: onKickOpenChange, onClose: onKickClose } = useDisclosure()

	const [ current, setCurrent ] = useState<User>()

	const [ skillFilter, setSkillFilter ] = useState<string[]>([ "" ])

	const [ page, setPage ] = useState(1)
	const { state, data, error, get } = useRest<PaginationResult<User>>(`${ parent ? `/${ parent.resourceType.toLowerCase() }s/${ parent.id }/users` : `/users` }?page=${ page }${ skillFilter.join(",") ? `&skills=${ skillFilter.join(",") }` : "" }`, {
		auto: true,
		onError: onErrorOpen
	})

	const { state: kickState, error: kickError, del: kick } = useRest(`/${ parent?.resourceType.toLowerCase() }s/${ parent?.id }/users`, {
		onSuccess: onKickClose,
		onError: onErrorOpen
	})

	const { data: skills, error: skillError } = useRest<Skill[]>("/skills", { auto: true })
	const { state: deleteState, error: userError, del } = useRest(`/users/${ current?.id }`, {
		onSuccess: () => {
			get()
			onDeleteClose()
		},
		onError: onErrorOpen
	})

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">
				<BackButton/>
				Nutzer Liste
				{ parent && <span className="text-default-500 ml-2">{ parent.name }</span> }
			</CardHeader>
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
								<TableCell><span className="whitespace-nowrap">{ user.lastName }, { user.firstName }</span></TableCell>
								<TableCell><a className="whitespace-nowrap" href={ `mailto:${ user.email }` }>{ user.email }</a></TableCell>
								<TableCell><Chip variant="flat" color={ user.admin ? "success" : "primary" }>{ user.admin ? "Admin" : "Nutzer" }</Chip></TableCell>
								<TableCell>
									<span className="relative flex justify-end items-center gap-2">
										<button className="text-lg text-default-500 hover:opacity-70" onClick={ () => {
											setCurrent(user)
											onDetailsOpen()
										} }>
											<Eye height="20px"/>
										</button>

										{ parent && <button className="text-lg text-default-500 hover:opacity-70" onClick={ () => {
											setCurrent(user)
											onKickOpen()
										} }>
											<UserMinus height="20px" className="[&>line]:text-danger"/>
										</button> }

										<button className="text-lg text-danger hover:opacity-70" onClick={ () => {
											setCurrent(user)
											onDeleteOpen()
										} }>
											<Trash2 height="20px"/>
										</button>
									</span>
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

				<div className="w-full flex gap-2 justify-between flex-wrap items-end">
					{ parent && <Button size="sm" className="flex-grow sm:flex-grow-0" as={ Link } to="/@me/users">Alle Anzeigen</Button> }
					{ !!data?.data.length && <Button size="sm" color="primary" className="flex-grow sm:flex-grow-0 font-bold" onPress={ () => download.current && download.current(`${ import.meta.env._API }${ parent ? `/${ parent }` : "" }/users/csv`) } startContent={ <FolderInput strokeWidth="2.5px" height="20px"/> }>Exportieren</Button> }

					<span className="hidden sm:block sm:flex-grow"/>

					{ skills && <Select
						size="sm" className="w-[200px]"
						selectionMode="multiple"
						label="Nach Fähigkeiten Filtern"
						startContent={ <Search height="15px" strokeWidth="3" className="text-default-500"/> }
						selectedKeys={ skillFilter }
						onSelectionChange={ s => {
							const set = [ ...s ] as string[]

							if(set.includes("") && !skillFilter.includes("") || !set.length) setSkillFilter([ "" ])
							else setSkillFilter(set.filter(x => x))
						} }>
						{ [ ...skills!.map(skill => (
							<SelectItem key={ skill.id }>{ skill.name }</SelectItem>
						)), <SelectItem key="" textValue="Kein Filter"><i>Kein Filter</i></SelectItem> ] }
					</Select> }
				</div>
			</CardFooter>

			<ErrorModal error={ (error || kickError || skillError || userError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>

			<Modal isOpen={ isDetailsOpen } onOpenChange={ onDetailsOpenChange } size="xl">
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">{ current?.lastName }, { current?.firstName } ({ current?.id })</ModalHeader>
					<Divider/>
					<ModalBody className="min-h-[50vh] max-h-[80vh] overflow-auto flex flex-col gap-4 pb-4">
						{ current && <>
							<CustomInputList user={ current } readonly/>

							{ skills?.length && <SkillList target={ current } className="shadow-none"/> }
						</> }
					</ModalBody>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isDeleteOpen } onOpenChange={ onDeleteOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Konto Löschen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Konto <b>{ current?.firstName } { current?.lastName }</b> ({ current?.email }) wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!
					</ModalBody>
					<Divider/>
					<ModalFooter className="p-2">
						<Button size="sm" color="danger" variant="solid" onPress={ () => del() } isLoading={ deleteState === "loading" } spinner={ <Spinner/> }>Löschen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isKickOpen } onOpenChange={ onKickOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Konto Entfernen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Konto <b>{ current?.firstName } { current?.lastName }</b> ({ current?.email }) wirklich von <b>{ parent?.name }</b> entfernt werden? Das Konto kann nur mit einer Einladung erneut beitreten!
					</ModalBody>
					<Divider/>
					<ModalFooter className="p-2">
						<Button size="sm" color="danger" variant="solid" onPress={ () => kick({ path: `/${ current?.id }` }) } isLoading={ kickState === "loading" } spinner={ <Spinner/> }>Entfernen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Download target="_blank" ref={ download }/>
		</Card>
	)
}