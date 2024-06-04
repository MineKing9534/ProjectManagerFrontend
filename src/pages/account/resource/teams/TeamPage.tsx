import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, Divider, Link, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react"
import { useRest } from "../../../../hooks/useRest.ts"
import { Team } from "../../../../types/Team.ts"
import { useParams } from "react-router-dom"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useNavigate } from "react-router"
import { useUser } from "../../../../hooks/useUser.ts"
import { CalendarDays, Files, Settings, UserPlus, Users } from "lucide-react"
import { useCopyToClipboard } from "usehooks-ts"
import BackButton from "../../../../components/BackButton.tsx"

export default function TeamPage() {
	const user = useUser()!
	const navigate = useNavigate()

	const params = useParams()
	const id = params.id

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const [ , copy ] = useCopyToClipboard()

	const { state, data, error: teamError } = useRest<Team>(`/teams/${ id }`, {
		auto: true,
		onError: onErrorOpen
	})
	const { data: invite, error: inviteError, post } = useRest<{ token: string }>(`/teams/${ id }/invites`, {
		onSuccess: data => {
			onOpen()
			copy(`${ import.meta.env._URL }/invite?token=${ data.token }`)
		},
		onError: onErrorOpen
	})

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center"><BackButton/> { data?.name }</CardHeader>
			<Divider/>
			<CardBody>
				{ state === "loading" && <CircularProgress aria-label="Lade" className="m-auto"/> }
				{ data && data.name }
			</CardBody>
			<Divider/>
			<CardFooter className="flex w-full justify-between py-2">
				<div className="flex gap-2">
					<Button size="sm" onPress={ () => navigate(`/@me/meetings?parent=${ id }`) } as={ Link } startContent={ <CalendarDays strokeWidth="2.5px" height="20px"/> }>Treffen</Button>
					<Button size="sm" onPress={ () => navigate(`/@me/teams/${ id }/files`) } as={ Link } startContent={ <Files strokeWidth="2.5px" height="20px"/> }>Dateien</Button>
				</div>
				{ user.admin && <div className="flex gap-2">
					<Button size="sm" onPress={ () => post() } startContent={ <UserPlus strokeWidth="2.5px" height="20px"/> }>Einladung Erstellen</Button>
					<Button size="sm" onPress={ () => navigate(`/@me/users?parent=${ id }`) } as={ Link } startContent={ <Users strokeWidth="2.5px" height="20px"/> }>Teilnehmer</Button>
					<Button size="sm" onPress={ () => navigate(`/@me/teams/${ id }/settings`) } startContent={ <Settings strokeWidth="2.5px" height="20px"/> }>Einstellungen</Button>
				</div> }
			</CardFooter>

			<ErrorModal error={ (teamError || inviteError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => navigate("/@me/teams") }/>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } size="xl">
				<ModalContent>
					<ModalHeader className="py-2">Neue Einladung</ModalHeader>
					<Divider/>
					<ModalBody className="block leading-relaxed py-4">
						<p className="pb-3">Neue Einladung erstellt: <Link showAnchorIcon href={ `${ import.meta.env._URL }/invite?token=${ invite?.token }` }>Einladungs-Link</Link></p>
						<p className="pb-3">Geben Sie diesen Link an Personen weiter, die diesem Projekt betreten können sollen. Der Link kann ebenfalls dazu verwendet werden, ein neues Konto zu erstellen.</p>
						<p className="text-foreground-500">Der Link wurde bereits automatisch in die Zwischenablage kopiert.</p>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Card>
	)
}