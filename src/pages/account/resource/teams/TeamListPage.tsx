import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useRest } from "../../../../hooks/useRest.ts"
import Spinner from "../../../../components/Spinner.tsx"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useUser } from "../../../../hooks/useUser.ts"
import { Team } from "../../../../types/Team.ts"
import { useNavigate } from "react-router"
import { PencilLine, Plus } from "lucide-react"
import { PaginationResult } from "../../../../types/PaginationResult.ts"
import BackButton from "../../../../components/BackButton.tsx"

export default function TeamListPage() {
	const navigate = useNavigate()
	const user = useUser()!

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state: createState, error: createError, post } = useRest<Team>("/teams", {
		onSuccess: data => navigate(`/@me/teams/${ data.id }`),
		onError: onErrorOpen
	})
	const [ name, setName ] = useState("")

	const [ page, setPage ] = useState(1)
	const { state, data, error } = useRest<PaginationResult<Team>>(user.admin ? `/teams?page=${ page }` : `/users/@me/teams?page=${ page }`, {
		auto: true,
		onError: onErrorOpen
	})

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">
				<BackButton/>
				Teams
			</CardHeader>
			<Divider/>
			<CardBody>
				<Table isHeaderSticky removeWrapper aria-label="Team Liste" selectionMode="single" className="h-full">
					<TableHeader>
						<TableColumn key="name">Name</TableColumn>
					</TableHeader>

					<TableBody
						isLoading={ state === "loading" } loadingContent={ <Spinner/> }
						items={ data?.data || [] } emptyContent="Keine Teams"
					>
						{ team => (
							<TableRow key={ team.id }>
								<TableCell className="whitespace-nowrap"><Link to={ `/@me/teams/${ team.id }` } className="block w-full h-full">{ team.name }</Link></TableCell>
							</TableRow>
						) }
					</TableBody>
				</Table>
			</CardBody>

			<CardFooter className="flex-col gap-2 flex-shrink-0">
				{ (data?.totalPages || 1) > 1 && <div className="w-full flex justify-between">
					<span/>
					<Pagination
						aria-label="Seitenauswahl" isCompact showControls
						page={ page } total={ data?.totalPages || 1 } onChange={ (page) => setPage(page) }
					/>
					<span className="text-default-500 font-bold">Insgesamt { data?.totalEntries } Einträge</span>
				</div> }

				<div className="w-full flex gap-2 justify-end flex-wrap">
					{ user.admin && <Button size="sm" color="primary" className="flex-grow sm:flex-grow-0" onPress={ () => {
						setName("")
						onOpen()
					} } startContent={ <Plus height="20px" strokeWidth="2.5px"/> }>Erstellen</Button> }
				</div>
			</CardFooter>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Team Erstellen</ModalHeader>
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