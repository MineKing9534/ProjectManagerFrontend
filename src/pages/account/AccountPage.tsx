import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, CheckboxGroup, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react"
import { useUser, useUserRequest } from "../../hooks/useUser.ts"
import { useRest } from "../../hooks/useRest.ts"
import { Skill } from "../../types/Skill.ts"
import { PencilLine, Plus, Save, Trash2 } from "lucide-react"
import { FormEvent, useMemo, useState } from "react"
import Spinner from "../../components/Spinner.tsx"
import ErrorModal from "../../components/ErrorModal.tsx"

export default function AccountPage() {
	const user = useUser()!
	const { get } = useUserRequest()!

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

	function rename(event: FormEvent) {
		event.preventDefault()

		if(!firstNameValid || !lastName) return
		patchUser({ data: { firstName, lastName } })
	}

	const [ firstName, setFirstName ] = useState(user.firstName)
	const firstNameValid = useMemo(() => /^[a-zA-Zäöüß]{2,}$/.test(firstName), [ firstName ])

	const [ lastName, setLastName ] = useState(user.lastName)
	const lastNameValid = useMemo(() => /^[a-zA-Zäöüß]{2,}$/.test(lastName), [ lastName ])

	return (
		<Card className="h-full max-h-full select-none">
			<CardHeader className="text-3xl font-bold justify-center">Nutzer Informationen</CardHeader>
			<Divider/>
			<CardBody className="flex md:flex-row gap-5 [&>div]:flex-grow">
				<Card className="md:w-3/5 h-1/2 md:h-full">
					<CardHeader className="text-xl font-bold">Informationen</CardHeader>
					<CardBody className="pt-1 flex flex-col gap-5">
						<form onSubmit={ rename }>
							<h2 className="font-bold text-md mb-2">Name</h2>
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
								{ (firstName !== user.firstName || lastName !== user.lastName) && (firstNameValid && lastNameValid) &&
									<Button
										isDisabled={ renameState === "loading" } isLoading={ renameState === "loading" } spinner={ <Spinner/> } type="submit"
										className="font-bold flex-shrink-0 h-[56px] w-[56px]" color="primary" isIconOnly
									>
										{ renameState !== "loading" && <Save width="25px"/> }
									</Button>
								}
							</div>
						</form>

						<div>
							<h2 className="font-bold text-md mb-2">EMail-Einstellungen</h2>
							<CheckboxGroup value={ user.emailTypes } onValueChange={ value => patchUser({ data: { emailTypes: value } }) } isDisabled={ renameState === "loading" }>
								<Checkbox value="MEETING_CREATE">Ankündigungen von Veranstaltungen</Checkbox>
								<Checkbox value="MEETING_DELETE">Absage von Veranstaltungen</Checkbox>
								<Checkbox value="MEETING_UPDATE">Änderungen für Veranstaltungen</Checkbox>
								<Checkbox value="INFO_UPDATE">Änderungen der Informationsdatei</Checkbox>
							</CheckboxGroup>
						</div>
					</CardBody>
					<CardFooter className="p-2 flex-shrink-0 flex gap-2">
						Ihre ID: <b className="select-text">{ user?.id }</b>
					</CardFooter>
				</Card>

				<Card className="md:w-2/5 h-1/2 md:h-full">
					<CardHeader className="text-xl font-bold">Fähigkeiten</CardHeader>
					<CardBody className="pt-1">
						<CheckboxGroup isDisabled={ skillState === "loading" } value={ user.skills } onValueChange={ values => put({ data: { skills: values } }) }>
							{ skills?.map(skill =>
								<Checkbox key={ skill.id } value={ skill.id } className="max-w-full" classNames={ { label: "flex justify-between w-full before:hidden" } }>
									<span>{ skill.name }</span>
									{ user.admin && <span className="relative flex items-center gap-2">
										<Tooltip content="Bearbeiten" closeDelay={ 0 }>
											<button className="text-lg text-default-500 hover:opacity-70" onClick={ () => {
												setCurrent(skill.id)
												setName(skill.name)
												onOpen()
											} }>
												<PencilLine height="20px"/>
											</button>
										</Tooltip>
										<Tooltip color="danger" content="Löschen" closeDelay={ 0 }>
											<button className="text-lg text-danger hover:opacity-70" onClick={ () => del({ path: `/${ skill.id }` }) }>
												<Trash2 height="20px"/>
											</button>
										</Tooltip>
									</span> }
								</Checkbox>
							) }
						</CheckboxGroup>
						<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
							<ModalContent>
								<ModalHeader className="py-2">Fähigkeit { current ? "Bearbeiten" : "Erstellen" }</ModalHeader>
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
					<CardFooter className="p-2 flex-shrink-0">
						{ user.admin && <Tooltip content="Neue Fähigkeit erstellen" closeDelay={ 0 }>
							<Button size="sm" color="default" className="ml-auto hover:bg-success" isIconOnly onClick={ () => {
								setCurrent("")
								setName("")
								onOpen()
							} }><Plus/></Button>
						</Tooltip> }
					</CardFooter>
				</Card>
			</CardBody>

			<ErrorModal error={ error! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>
		</Card>
	)
}