import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, Divider, Link as ExternalLink, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import { useRest } from "../../../../hooks/useRest.ts"
import { Link, useParams, useSearchParams } from "react-router-dom"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useNavigate } from "react-router"
import { useUser } from "../../../../hooks/useUser.ts"
import { Files, Settings, UserMinus, UserPlus, Users } from "lucide-react"
import { Meeting } from "../../../../types/Meeting.ts"
import BackButton from "../../../../components/BackButton.tsx"
import { useCopyToClipboard } from "usehooks-ts"
import MeetingTypeBadge from "./MeetingTypeBadge.tsx"
import ResourceInfo from "../file/ResourceInfo.tsx"
import Spinner from "../../../../components/Spinner.tsx"

export default function MeetingPage() {
	const user = useUser()!
	const navigate = useNavigate()
	const [ , copy ] = useCopyToClipboard()

	const params = useParams()
	const id = params.id

	const [ searchParams ] = useSearchParams()

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose, onOpenChange: onLeaveOpenChange } = useDisclosure()
	const { isOpen: isJoinOpen, onOpen: onJoinOpen, onClose: onJoinClose, onOpenChange: onJoinOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state, data, error: meetingError } = useRest<Meeting>(`/meetings/${ id }`, {
		auto: true,
		onError: onErrorOpen
	})

	const { data: invite, error: inviteError, post } = useRest<{ token: string }>(`/meetings/${ id }/invites`, {
		onSuccess: data => {
			onOpen()
			copy(`${ import.meta.env._URL }/invite?token=${ data.token }`)
		},
		onError: onErrorOpen
	})

	const { state: memberState, get: updateMemberState } = useRest(`/meetings/${ id }/users/@me`, {
		auto: true,
		onError: () => {
			if(searchParams.has("join")) onJoinOpen()
		}
	})
	const { state: leaveState, error: leaveError, put: join, del: leave } = useRest(`/meetings/${ id }/users/@me`, {
		onSuccess: () => {
			onLeaveClose()
			onJoinClose()

			updateMemberState()
		},
		onError: onErrorOpen
	})

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center"><BackButton/> Treffen { data?.name } <MeetingTypeBadge type={ data?.type || "MEETING" } className="absolute right-3"/></CardHeader>
			<Divider/>
			<CardBody>
				{ state === "loading" && <CircularProgress aria-label="Lade" className="m-auto"/> }
				{ data && <ResourceInfo resource={ data }/> }
			</CardBody>
			<Divider/>
			<CardFooter className="flex flex-wrap gap-2 w-full py-2">
				<Button size="sm" className="flex-grow sm:flex-grow-0" as={ Link } to={ `/@me/meetings/${ id }/files` } startContent={ <Files strokeWidth="2.5px" height="20px"/> }>Dateien</Button>
				{ memberState === "success" && <Button size="sm" className="flex-grow sm:flex-grow-0" startContent={ <UserMinus strokeWidth="2.5px" height="20px" className="[&>line]:text-danger"/> } onPress={ onLeaveOpen }>Verlassen</Button> }
				{ memberState === "error" && <Button size="sm" className="flex-grow sm:flex-grow-0" startContent={ <UserPlus strokeWidth="2.5px" height="20px" className="[&>line]:text-success"/> } onPress={ onJoinOpen }>Beitreten</Button> }

				<span className="hidden sm:block sm:flex-grow"/>

				{ user.admin && <>
					<Button size="sm" className="flex-grow sm:flex-grow-0" color="primary" onPress={ () => post() } startContent={ <UserPlus strokeWidth="2.5px" height="20px"/> }>Einladung Erstellen</Button>
					<Button size="sm" className="flex-grow sm:flex-grow-0" as={ Link } to={ `/@me/users?parent=meetings/${ id }` } startContent={ <Users strokeWidth="2.5px" height="20px"/> }>Teilnehmer</Button>
					<Button size="sm" className="flex-grow sm:flex-grow-0" as={ Link } to={ `/@me/meetings/${ id }/settings` } startContent={ <Settings strokeWidth="2.5px" height="20px"/> }>Einstellungen</Button>
				</> }
			</CardFooter>

			<ErrorModal error={ (meetingError || inviteError || leaveError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => meetingError && navigate("/@me/meetings") }/>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } size="xl">
				<ModalContent>
					<ModalHeader className="py-2">Neue Einladung</ModalHeader>
					<Divider/>
					<ModalBody className="block leading-relaxed py-4">
						<p className="pb-3">Neue Einladung erstellt: <ExternalLink showAnchorIcon href={ `${ import.meta.env._URL }/invite?token=${ invite?.token }` }>Einladungs-Link</ExternalLink></p>
						<p className="pb-3">Geben Sie diesen Link an Personen weiter, die diesem Treffen betreten können sollen. Der Link kann ebenfalls dazu verwendet werden, ein neues Konto zu erstellen.</p>
						<p className="text-foreground-500">Der Link wurde bereits automatisch in die Zwischenablage kopiert.</p>
					</ModalBody>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isLeaveOpen } onOpenChange={ onLeaveOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">Treffen Verlassen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll das Treffen wirklich verlassen werden? Dadruch wird signalisiert, dass du kein Interesse (oder keine Zeit) für dieses Treffen hast.
					</ModalBody>
					<Divider/>
					<ModalFooter className="p-2">
						<Button size="sm" color="danger" variant="solid" onPress={ () => leave() } isLoading={ leaveState === "loading" } spinner={ <Spinner/> }>Entfernen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isJoinOpen } onOpenChange={ onJoinOpenChange }>
				<ModalContent>
					<ModalHeader className="py-2">Treffen Beitreten</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Möchten Sie dem Treffen wirklich beitreten? Sie signalisieren dadurch, dass Sie Interesse haben und voraussichtlich anwesend sein werden.
					</ModalBody>
					<Divider/>
					<ModalFooter className="p-2">
						<Button size="sm" color="primary" variant="solid" onPress={ () => join() } isLoading={ leaveState === "loading" } spinner={ <Spinner/> }>Beitreten</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Card>
	)
}