import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react"
import { Link } from "react-router-dom"
import { useRest } from "../../hooks/useRest.ts"
import { FormEvent, useMemo, useState } from "react"
import { validateEmail } from "../../utils/validate.ts"
import { Mail, PencilLine } from "lucide-react"
import Spinner from "../../components/Spinner.tsx"
import ErrorModal from "../../components/ErrorModal.tsx"
import ErrorDescription from "../../components/ErrorDescription.tsx"
import { useNavigate } from "react-router"

export default function Register({ token }: { token: string }) {
	const navigate = useNavigate()

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()
	const { state, error, post } = useRest<{ token: string }>("/users", {
		onSuccess: onOpen,
		authorization: token || undefined
	})

	const [ email, setEmail ] = useState("")
	const emailValid = useMemo(() => validateEmail(email), [ email ])

	const [ firstName, setFirstName ] = useState("")
	const firstNameValid = useMemo(() => /^[a-zA-ZÄäÖöÜüß-]{2,}$/.test(firstName), [ firstName ])

	const [ lastName, setLastName ] = useState("")
	const lastNameValid = useMemo(() => /^[a-zA-ZÄäÖöÜüß-]{2,}$/.test(lastName), [ lastName ])

	function register(event: FormEvent) {
		event.preventDefault()

		if(!emailValid || !firstNameValid || !lastNameValid) return
		post({ data: { email, firstName, lastName } })
	}

	return (
		<Card className="w-full md:w-2/3 mx-auto select-none">
			<CardHeader className="text-3xl font-bold justify-center">Registrieren</CardHeader>
			<Divider/>
			<CardBody>
				<form className="flex flex-col gap-2 p-2" onSubmit={ register }>
					<div className="flex gap-3 flex-col md:flex-row">
						<Input
							value={ firstName } onValueChange={ setFirstName }
							isInvalid={ !firstNameValid } errorMessage={ firstNameValid || "Bitte geben Sie einen gültigen Namen ein" }
							type="text" autoComplete="given-name webauthn" isRequired
							label="Vorname" placeholder="Max"
							classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
							startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
						/>

						<Input
							value={ lastName } onValueChange={ setLastName }
							isInvalid={ !lastNameValid } errorMessage={ lastNameValid || "Bitte geben Sie einen gültigen Namen ein" }
							type="text" autoComplete="family-name webauthn" isRequired
							label="Namename" placeholder="Mustermann"
							classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
							startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
						/>
					</div>

					<Input
						value={ email } onValueChange={ setEmail }
						isInvalid={ !emailValid } errorMessage={ emailValid || "Bitte geben Sie eine gültige E-Mail Adresse ein" }
						type="email" autoComplete="email webauthn" isRequired
						label="E-Mail" placeholder="name@example.com"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <Mail height="15px" strokeWidth="3" className="text-default-500"/> }
					/>

					<Spacer/>
					<Button
						variant="solid" color="primary" disabled={ !emailValid || !firstNameValid || !lastNameValid } className="font-bold w-full"
						spinner={ <Spinner/> } isLoading={ state === "loading" } type="submit"
					>Registrieren</Button>

					<span className="mt-3 flex gap-2">
						Sie haben bereits ein Konto?
						<Link to="/" state={ `/invite?token=${ token }` } className="text-primary font-bold">Stattdessen anmelden</Link>
					</span>

					<ErrorModal error={ error! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>
					{ error &&
						<div className="mt-3 text-danger font-bold w-full text-center cursor-pointer" onClick={ onErrorOpen }>
							Fehler: <ErrorDescription error={ error }/>
						</div>
					}

					<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } onClose={ () => navigate("/") }>
						<ModalContent>
							<ModalHeader className="py-2">Registrierung Abgeschlossen</ModalHeader>
							<Divider/>
							<ModalBody className="block">
								Ihre Registrierung wurde verarbeitet. Wir haben eine E-Mail an <b>{ email }</b> gesendet, um sicher zu stellen, dass Sie Zugriff auf die angegebene e-Mail-Adresse haben.
								Diese E-Mail enthält einen Link, mit dem Sie ihre Registrierung Abschließen können.
							</ModalBody>
						</ModalContent>
					</Modal>
				</form>
			</CardBody>
		</Card>
	)
}