import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, CheckboxGroup, Divider, Input, Link as ExternalLink, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, useDisclosure } from "@nextui-org/react"
import { useUser, useUserRequest } from "../../hooks/useUser.ts"
import { useRest } from "../../hooks/useRest.ts"
import { Skill } from "../../types/Skill.ts"
import { BookUser, Box, CalendarDays, PencilLine, Plus, Save, Trash2, Users } from "lucide-react"
import { FormEvent, useMemo, useState } from "react"
import Spinner from "../../components/Spinner.tsx"
import ErrorModal from "../../components/ErrorModal.tsx"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router"

export default function AccountPage() {
	const user = useUser()!
	const { get } = useUserRequest()!

	const navigate = useNavigate()

	const { data: skills, get: updateSkills } = useRest<Skill[]>("/skills", { auto: true })
	const { state: skillUpdateState, post, del, patch } = useRest<Skill[]>("/skills", {
		onSuccess: () => {
			updateSkills()
			onClose()
		}
	})

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
	const [ current, setCurrent ] = useState("")
	const [ name, setName ] = useState("")

	const { state: skillState, put } = useRest(`/users/@me/skills`, {
		onSuccess: () => get()
	})

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
		patchUser({ data: { firstName, lastName, info } })
	}

	const [ firstName, setFirstName ] = useState(user.firstName)
	const firstNameValid = useMemo(() => /^[a-zA-ZÄäÖöÜüß-]{2,}$/.test(firstName), [ firstName ])

	const [ lastName, setLastName ] = useState(user.lastName)
	const lastNameValid = useMemo(() => /^[a-zA-ZÄäÖöÜüß-]{2,}$/.test(lastName), [ lastName ])

	const [ info, setInfo ] = useState(user.info)

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
									label="Namename" placeholder="Mustermann"
									startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
								/>
							</div>

							<Input
								value={ info } onValueChange={ setInfo } isDisabled={ renameState === "loading" }
								type="text" autoComplete="family-name"
								label="Zusätzliche informationen" placeholder="Zusätzliche wichtige Informationen zu ihrer Person"
								startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
							/>

							{ (firstName !== user.firstName || lastName !== user.lastName || info !== user.info) && (firstNameValid && lastNameValid) &&
								<Button
									isDisabled={ renameState === "loading" } isLoading={ renameState === "loading" } spinner={ <Spinner/> } type="submit"
									className="font-bold md:w-fit" color="primary" startContent={ <Save width="25px"/> } size="sm"
								>
									Speichern
								</Button>
							}
						</form>

						<div>
							<h2 className="font-bold text-md mb-2">Zugangsdaten</h2>
							<div className="flex gap-2 md:flex-col">
								<Button className="w-fit hover:bg-warning !duration-400" color="primary" onClick={ () => resetPassword() } spinner={ <Spinner/> } isLoading={ passwordState === "loading" }>Passwort Ändern</Button>
							</div>
						</div>

						<div className="flex gap-4 flex-col xl:flex-row xl:gap-20 w-full">
							<div className="xl:w-1/2">
								<h2 className="font-bold text-md mb-2 flex-grow">E-Mail Einstellungen</h2>
								<CheckboxGroup value={ user.emailTypes } onValueChange={ value => patchUser({ data: { emailTypes: value } }) } isDisabled={ renameState === "loading" }>
									<Checkbox value="INFO_UPDATE">Änderungen der Informationsdatei</Checkbox>
									<Checkbox value="MEETING_CREATE">Ankündigungen von Veranstaltungen</Checkbox>
									<Checkbox value="MEETING_DELETE">Absage von Veranstaltungen</Checkbox>
									<Checkbox value="MEETING_UPDATE">Änderungen für Veranstaltungen</Checkbox>
									<Checkbox value="PROJECT_ADD">Neues Projekt Verfügbar</Checkbox>
									<Checkbox value="PROJECT_DELETE">Absage van Projekten</Checkbox>
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

				<Card className="md:w-2/5 h-1/2 md:h-full">
					<CardHeader className="text-xl font-bold">Fähigkeiten</CardHeader>
					<CardBody className="pt-1">
						<ScrollShadow className="p-2 pr-0">
							<CheckboxGroup classNames={ { wrapper: "gap-4" } } isDisabled={ skillState === "loading" } value={ user.skills } onValueChange={ values => put({ data: { skills: values } }) }>
								{ skills?.map(skill =>
									<Checkbox key={ skill.id } value={ skill.id } className="max-w-full rounded-lg !p-1 hover:bg-default-100" classNames={ { label: "flex justify-between w-full before:hidden" } }>
										<span>{ skill.name }</span>
										{ user.admin && <span className="relative flex items-center gap-2">
											<button className="text-lg text-default-500 hover:opacity-70" onClick={ () => {
												setCurrent(skill.id)
												setName(skill.name)
												onOpen()
											} }>
												<PencilLine height="20px"/>
											</button>

											<button className="text-lg text-danger hover:opacity-70" onClick={ () => del({ path: `/${ skill.id }` }) }>
												<Trash2 height="20px"/>
											</button>
										</span> }
									</Checkbox>
								) }
							</CheckboxGroup>
						</ScrollShadow>
						<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
							<ModalContent>
								<ModalHeader className="py-3 font-bold text-xl">Fähigkeit { current ? "Bearbeiten" : "Erstellen" }</ModalHeader>
								<Divider/>
								<form onSubmit={ event => {
									event.preventDefault()

									if(current) patch({
										path: `/${ current }`,
										data: { name }
									})
									else post({ data: { name } })
								} }>
									<ModalBody className="pt-5 pb-0">
										<Input
											value={ name } onValueChange={ setName } isDisabled={ skillUpdateState === "loading" }
											type="text" autoComplete="given-name" minLength={ 3 } isRequired={ !current }
											label="Name" placeholder="Violine"
											classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
											startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
										/>
									</ModalBody>
									<ModalFooter>
										<Button type="submit" isLoading={ skillUpdateState === "loading" } spinner={ <Spinner/> } isDisabled={ name.length < 2 } className="font-bold" size="sm" color="primary">{ current ? "Speichern" : "Erstellen" }</Button>
									</ModalFooter>
								</form>
							</ModalContent>
						</Modal>
					</CardBody>
					<CardFooter className="p-2 flex-shrink-0 justify-end">
						{ user.admin && <Button size="sm" color="primary" onClick={ () => {
							setCurrent("")
							setName("")
							onOpen()
						} } startContent={ <Plus height="20px" strokeWidth="2.5px"/> }>Erstellen</Button> }
					</CardFooter>
				</Card>
			</CardBody>

			<ErrorModal error={ (error || passwordError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>
		</Card>
	)
}