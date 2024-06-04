import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { useRest } from "../../../../hooks/useRest.ts"
import { chunk } from "../../../../utils/chunk.ts"
import Spinner from "../../../../components/Spinner.tsx"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useUser } from "../../../../hooks/useUser.ts"
import { Team } from "../../../../types/Team.ts"
import { useNavigate } from "react-router"
import { PencilLine, Plus } from "lucide-react"

const pageSize = 15

export default function TeamListPage() {
	const navigate = useNavigate()
	const user = useUser()!

	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state: createState, error: createError, post } = useRest("/teams", {
		onSuccess: () => {
			onClose()
			get()
		},
		onError: onErrorOpen
	})
	const [ name, setName ] = useState("")

	const { state, data, error, get } = useRest<Team[]>(user.admin ? "/teams" : "/users/@me/teams", {
		auto: true,
		onError: onErrorOpen
	})
	const chunks = useMemo(() => data ? chunk(data, pageSize) : [], [ data ])

	const [ page, setPage ] = useState(1)

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">Team Liste</CardHeader>
			<Divider/>
			<CardBody>
				<Table isHeaderSticky removeWrapper aria-label="Team Liste" selectionMode="single">
					<TableHeader>
						<TableColumn key="name">Name</TableColumn>
					</TableHeader>

					<TableBody
						isLoading={ state === "loading" } loadingContent={ <Spinner/> }
						items={ chunks[page - 1] || [] } emptyContent="Keine Teams"
					>
						{ team => (
							<TableRow key={ team.id }>
								<TableCell><Link to={ `/@me/teams/${ team.id }` } className="block w-full h-full">{ team.name }</Link></TableCell>
							</TableRow>
						) }
					</TableBody>
				</Table>
			</CardBody>

			<CardFooter className="justify-between py-2 flex-shrink-0">
				<span/>
				{ chunks.length > 1 && <Pagination
					aria-label="Seitenauswahl" className=""
					isCompact showControls
					page={ page } total={ chunks.length } onChange={ (page) => setPage(page) }
				/> }
				<Button size="sm" className="hover:bg-primary" onPress={ () => {
					setName("")
					onOpen()
				} } isIconOnly><Plus/></Button>
			</CardFooter>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">Team Erstellen</ModalHeader>
					<Divider/>
					<form onSubmit={ event => {
						event.preventDefault()
						post({ data: { name } })
					} }>
						<ModalBody className="pt-5 pb-0">
							<Input
								value={ name } onValueChange={ setName } isDisabled={ createState === "loading" }
								type="text" autoComplete="given-name" minLength={ 3 } isRequired
								label="Name" placeholder="Team"
								classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
								startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
							/>
						</ModalBody>
						<ModalFooter>
							<Button type="submit" isLoading={ createState === "loading" } spinner={ <Spinner/> } isDisabled={ name.length < 2 } className="font-bold" size="sm" color="primary">Erstellen</Button>
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>

			<ErrorModal error={ (error || createError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => error && navigate("/@me") }/>
		</Card>
	)
}