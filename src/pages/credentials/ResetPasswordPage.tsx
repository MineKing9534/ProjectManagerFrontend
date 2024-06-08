import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader, Spacer, useDisclosure } from "@nextui-org/react"
import { Mail } from "lucide-react"
import Spinner from "../../components/Spinner.tsx"
import ErrorModal from "../../components/ErrorModal.tsx"
import ErrorDescription from "../../components/ErrorDescription.tsx"
import { FormEvent, useMemo, useState } from "react"
import { validateEmail } from "../../utils/validate.ts"
import { useRest } from "../../hooks/useRest.ts"
import { useNavigate } from "react-router"
import BackButton from "../../components/BackButton.tsx"

export default function ResetPasswordPage() {
	const navigate = useNavigate()

	const [ email, setEmail ] = useState("")
	const emailValid = useMemo(() => validateEmail(email), [ email ])

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state, error, post } = useRest("/auth/reset-password", {
		onSuccess: onOpen
	})

	function reset(event: FormEvent) {
		event.preventDefault()

		if(!emailValid) return
		post({ data: { email } })
	}

	return (
		<Card className="w-full md:w-2/3 mx-auto select-none">
			<CardHeader className="text-3xl font-bold justify-center"><BackButton/> Passwort zurücksetzten</CardHeader>
			<Divider/>
			<CardBody>
				<form className="flex flex-col gap-2 p-2" onSubmit={ reset }>
					<Input
						value={ email } onValueChange={ setEmail }
						isInvalid={ !emailValid } errorMessage={ emailValid || "Bitte geben Sie eine gültige E-Mail Adresse ein" }
						type="email" autoComplete="email webauthn" isRequired
						label="E-Mail" placeholder="name@example.com"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <Mail height="15px" strokeWidth="3" className="text-default-500"/> }
					/>

					<Spacer/>
					<Button variant="solid" color="primary" disabled={ !emailValid } className="font-bold w-full" spinner={ <Spinner/> } isLoading={ state === "loading" } type="submit">Email zum Zurücksetzten senden</Button>

					<Modal isOpen={ isOpen } onOpenChange={ onOpenChange } onClose={ () => navigate("/") }>
						<ModalContent>
							<ModalHeader className="py-2">E-Mail verschickt</ModalHeader>
							<Divider/>
							<ModalBody className="block">
								Es wurde eine E-Mail an <b>{ email }</b> gesendet. Diese enthält einen link, mit dem Sie ein neues Passwort festlegen können.
							</ModalBody>
						</ModalContent>
					</Modal>

					<ErrorModal error={ error! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>
					{ error &&
						<div className="mt-5 text-danger font-bold w-full text-center cursor-pointer" onClick={ onErrorOpen }>
							Fehler: <ErrorDescription error={ error }/>
						</div>
					}
				</form>
			</CardBody>
		</Card>
	)
}