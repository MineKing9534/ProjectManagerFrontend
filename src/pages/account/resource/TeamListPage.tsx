import { Card, CardBody, CardHeader, CircularProgress, Divider, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { useRest } from "../../../hooks/useRest.ts"
import { chunk } from "../../../utils/chunk.ts"
import Spinner from "../../../components/Spinner.tsx"
import ErrorModal from "../../../components/ErrorModal.tsx"
import { useUser } from "../../../hooks/useUser.ts"
import { Team } from "../../../types/Team.ts"

const pageSize = 15

export default function TeamListPage() {
	const user = useUser()!

	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state, data, error } = useRest<Team[]>(user.admin ? "/teams" : "/users/@me/teams", {
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
				{ state === "loading" && <CircularProgress aria-label="Lade Teams" className="m-auto"/> }
				{ data && <Table isHeaderSticky removeWrapper aria-label="Team Liste" selectionMode="single">
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
				</Table> }
			</CardBody>

			<ErrorModal error={ error! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>

			{ chunks.length > 1 && <Pagination
				aria-label="Seitenauswahl" className="m-0 !p-0 absolute bottom-2 left-2 md:left-1/2 md:transform md:-translate-x-1/2"
				isCompact showControls
				page={ page } total={ chunks.length } onChange={ (page) => setPage(page) }
			/> }
		</Card>
	)
}