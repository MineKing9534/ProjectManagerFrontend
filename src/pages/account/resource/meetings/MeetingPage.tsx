import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, Divider, Link, useDisclosure } from "@nextui-org/react"
import { useRest } from "../../../../hooks/useRest.ts"
import { useParams } from "react-router-dom"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useNavigate } from "react-router"
import { useUser } from "../../../../hooks/useUser.ts"
import { Files, Settings, Users } from "lucide-react"
import { Meeting } from "../../../../types/Meeting.ts"

export default function MeetingPage() {
	const user = useUser()!
	const navigate = useNavigate()

	const params = useParams()
	const id = params.id

	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state, data, error: meetingError } = useRest<Meeting>(`/meetings/${ id }`, {
		auto: true,
		onError: onErrorOpen
	})
	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">{ data?.name }</CardHeader>
			<Divider/>
			<CardBody>
				{ state === "loading" && <CircularProgress aria-label="Lade" className="m-auto"/> }
				{ data && data.name }
			</CardBody>
			<Divider/>
			<CardFooter className="flex w-full justify-between py-2">
				<div className="flex gap-2">
					<Button size="sm" onPress={ () => navigate(`/@me/meetings/${ id }/files`) } as={ Link } startContent={ <Files strokeWidth="2.5px" height="20px"/> }>Dateien</Button>
				</div>
				{ user.admin && <div className="flex gap-2">
					<Button size="sm" onPress={ () => navigate(`/@me/users?parent=${ id }`) } as={ Link } startContent={ <Users strokeWidth="2.5px" height="20px"/> }>Teilnehmer</Button>
					<Button size="sm" onPress={ () => navigate(`/@me/meetings/${ id }/settings`) } startContent={ <Settings strokeWidth="2.5px" height="20px"/> }>Einstellungen</Button>
				</div> }
			</CardFooter>

			<ErrorModal error={ meetingError! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => navigate("/@me/meetings") }/>
		</Card>
	)
}