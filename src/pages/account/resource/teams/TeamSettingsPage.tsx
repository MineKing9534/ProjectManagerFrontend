import { Button, Card, CardBody, CardFooter, CardHeader, CircularProgress, Divider, Input, useDisclosure } from "@nextui-org/react"
import ErrorModal from "../../../../components/ErrorModal.tsx"
import { useParams } from "react-router-dom"
import { useRest } from "../../../../hooks/useRest.ts"
import { Team } from "../../../../types/Team.ts"
import { useNavigate } from "react-router"
import Spinner from "../../../../components/Spinner.tsx"
import { PencilLine, Save } from "lucide-react"
import { useState } from "react"
import BackButton from "../../../../components/BackButton.tsx"

export default function TeamSettingsPage() {
	const navigate = useNavigate()

	const params = useParams()
	const id = params.id

	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { data, error, get } = useRest<Team>(`/teams/${ id }`, {
		auto: true,
		onError: onErrorOpen,
		onSuccess: data => {
			setName(data.name)
		}
	})

	const { state: editState, error: editError, patch } = useRest(`/teams/${ id }`, {
		onError: onErrorOpen,
		onSuccess: get
	})

	const [ name, setName ] = useState("")

	function update() {
		patch({
			data: {
				name
			}
		})
	}

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center"><BackButton/> { data?.name } Bearbeiten</CardHeader>
			<Divider/>
			<CardBody>
				{ !data && <CircularProgress aria-label="Lade" className="m-auto"/> }
				{ data && <>
					<Input
						value={ name } onValueChange={ setName } isDisabled={ editState === "loading" }
						type="text" autoComplete="given-name" minLength={ 3 } isRequired
						label="Name" placeholder="Team"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
					/>
				</> }
			</CardBody>

			{ (name !== data?.name && name.length >= 3) && <>
				<Divider/>
				<CardFooter className="flex w-full justify-end py-2">
					<Button size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Save strokeWidth="2.5px" height="20px"/> } onPress={ update }>Speichern</Button>
				</CardFooter>
			</>}

			<ErrorModal error={ (error || editError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange } onClose={ () => error && navigate("/@me/teams") }/>
		</Card>
	)
}