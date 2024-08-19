import { Button, Card, CardBody, CardHeader, Checkbox, CheckboxGroup, Divider, Input, Link as ExternalLink, useDisclosure } from "@nextui-org/react"
import { useUser, useUserRequest } from "../../hooks/useUser.ts"
import { useRest } from "../../hooks/useRest.ts"
import { BookUser, Box, CalendarDays, PencilLine, Save, Users } from "lucide-react"
import { FormEvent, useMemo, useState } from "react"
import Spinner from "../../components/Spinner.tsx"
import ErrorModal from "../../components/ErrorModal.tsx"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router"
import CustomInputList from "./input/CustomInputList.tsx";
import SkillList from "./SkillList.tsx";

export default function AccountPage() {
	const user = useUser()!
	const { get } = useUserRequest()!

	const navigate = useNavigate()

	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()
	const { state: renameState, error, patch: patchUser } = useRest("/users/@me", {
		onSuccess: () => get(),
		onError: () => onErrorOpen()
	})

	const { state: passwordState, error: passwordError, post: resetPassword } = useRest<{ token: string }>("/users/@me/reset-password", {
		onError: onErrorOpen,
		onSuccess: data => navigate(`/password?token=${ data.token }`)
	})

	function rename(event: FormEvent) {
		event.preventDefault()

		if(!firstNameValid || !lastName) return
		patchUser({ data: { firstName, lastName } })
	}

	const [ firstName, setFirstName ] = useState(user.firstName)
	const firstNameValid = useMemo(() => /^[a-zA-ZÄäÖöÜüß-]{2,}$/.test(firstName), [ firstName ])

	const [ lastName, setLastName ] = useState(user.lastName)
	const lastNameValid = useMemo(() => /^[a-zA-ZÄäÖöÜüß-]{2,}$/.test(lastName), [ lastName ])

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">Nutzer Informationen</CardHeader>
			<Divider/>
			<CardBody className="flex md:flex-row gap-5 [&>div]:flex-grow">
				<Card className="md:w-3/5 h-1/2 md:h-full">
					<CardHeader className="text-xl font-bold">Einstellungen</CardHeader>
					<CardBody className="pt-1 flex flex-col gap-5">
						<form onSubmit={ rename } className="flex gap-3 flex-col">
							<h2 className="font-bold text-md">Informationen</h2>
							<div className="flex gap-3 flex-col md:flex-row">
								<Input
									value={ firstName } onValueChange={ setFirstName } isDisabled={ renameState === "loading" }
									isInvalid={ !firstNameValid } errorMessage={ firstNameValid || "Bitte geben Sie einen gültigen Namen ein" }
									type="text" autoComplete="given-name"
									label="Vorname" placeholder="Max"
									startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
								/>

								<Input
									value={ lastName } onValueChange={ setLastName } isDisabled={ renameState === "loading" }
									isInvalid={ !lastNameValid } errorMessage={ lastNameValid || "Bitte geben Sie einen gültigen Namen ein" }
									type="text" autoComplete="family-name"
									label="Nachname" placeholder="Mustermann"
									startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
								/>
							</div>

							{ (firstName !== user.firstName || lastName !== user.lastName) && (firstNameValid && lastNameValid) &&
								<Button
									isDisabled={ renameState === "loading" } isLoading={ renameState === "loading" } spinner={ <Spinner/> } type="submit"
									className="font-bold md:w-fit" color="primary" startContent={ <Save width="25px"/> } size="sm"
								>
									Speichern
								</Button>
							}
						</form>

						<CustomInputList user={ user } edit={ user.admin }/>

						<div>
							<h2 className="font-bold text-md mb-2">Zugangsdaten</h2>
							<div className="flex gap-2 md:flex-col">
								<Button className="w-fit hover:bg-warning !duration-400" color="primary" onClick={ () => resetPassword() } spinner={ <Spinner/> } isLoading={ passwordState === "loading" }>Passwort Ändern</Button>
							</div>
						</div>

						<div className="flex gap-4 flex-col xl:flex-row xl:gap-20 w-full">
							<div className="xl:w-1/2">
								<h2 className="font-bold text-md mb-2 flex-grow">Ich möchte E-Mail-Benachrichtigungen erhalten bei...</h2>
								<CheckboxGroup value={ user.emailTypes } onValueChange={ value => patchUser({ data: { emailTypes: value } }) } isDisabled={ renameState === "loading" }>
									<Checkbox value="INFO_UPDATE">Änderungen der Informationsdatei</Checkbox>
									<Checkbox value="MEETING_CREATE">Ankündigungen von Veranstaltungen</Checkbox>
									<Checkbox value="MEETING_DELETE">Absagen von Veranstaltungen</Checkbox>
									<Checkbox value="MEETING_UPDATE">Änderungen für Veranstaltungen</Checkbox>
									<Checkbox value="PROJECT_ADD">Neuen verfügbaren Projekten</Checkbox>
									<Checkbox value="PROJECT_DELETE">Absagen von Projekten</Checkbox>
								</CheckboxGroup>
							</div>

							<div className="xl:w-1/2">
								<h2 className="font-bold text-md mb-2 flex-grow flex justify-between">
									Schnellverknüpfungen
									<ExternalLink className="text-default-500" showAnchorIcon isExternal href="https://github.com/MineKing9534/ProjectManagerFrontend/blob/master/ResourceTypes.md">Erklärung</ExternalLink>
								</h2>
								<div className="flex flex-col gap-1 w-full">
									{ (user.admin && <Link to="/@me/users" className="flex gap-2 py-1 px-2 rounded-lg hover:bg-default-100"><Users width="20px"/> Nutzerliste</Link>) as never }
									<Link to="/@me/meetings" className="flex gap-2 py-1 px-2 rounded-lg hover:bg-default-100"><CalendarDays width="20px"/> Veranstaltungen</Link>
									<Link to="/@me/projects" className="flex gap-2 py-1 px-2 rounded-lg hover:bg-default-100"><Box width="20px"/> Projekte</Link>
									<Link to="/@me/teams" className="flex gap-2 py-1 px-2 rounded-lg hover:bg-default-100"><BookUser width="20px"/> Teams</Link>
								</div>
							</div>
						</div>

						<span className="p-2 flex-shrink-0 mt-auto">
							Ihre ID: <b className="select-text">{ user?.id }</b>
						</span>
					</CardBody>
				</Card>

				<SkillList edit={ user.admin } target={ user } className="md:w-2/5 h-1/2 md:h-full"/>
			</CardBody>

			<ErrorModal error={ (error || passwordError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>
		</Card>
	)
}