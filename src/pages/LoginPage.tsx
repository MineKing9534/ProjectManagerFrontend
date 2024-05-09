import { Button, Card, CardBody, CardHeader, Divider, Input, Spacer, useDisclosure } from "@nextui-org/react"
import { FormEvent, useMemo, useState } from "react"
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react"
import { useRest } from "../hooks/useRest.ts"
import Spinner from "../components/Spinner.tsx"
import ErrorModal from "../components/ErrorModal.tsx"
import { useToken } from "../hooks/useToken.ts"
import { useLocation, useNavigate } from "react-router"
import { validateEmail, validatePassword } from "../utils/validate.ts"
import ErrorDescription from "../components/ErrorDescription.tsx"

export default function LoginPage() {
	const { setToken } = useToken()
	const location = useLocation()
	const navigate = useNavigate()

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { state, error, post } = useRest<{ token: string }>("/login", {
		onSuccess: data => {
			setToken(data.token)
			navigate(location.state ? location.state : "/@me")
		}
	})

	const [ email, setEmail ] = useState("")
	const emailValid = useMemo(() => validateEmail(email), [email])

	const [ password, setPassword ] = useState("")
	const passwordValid = useMemo(() => validatePassword(password), [password])

	const [ visible, setVisible ] = useState(false)

	function login(event: FormEvent) {
		event.preventDefault()

		if(!emailValid || !passwordValid) return
		post({ data: { email, password } })
	}

	return (
		<Card className="w-full md:w-2/3 mx-auto select-none">
			<CardHeader className="text-3xl font-bold justify-center">Anmelden</CardHeader>
			<Divider/>
			<CardBody>
				<form className="flex flex-col gap-2 p-2" onSubmit={ login }>
					<Input
						value={ email } onValueChange={ setEmail }
						isInvalid={ !emailValid } errorMessage={ emailValid || "Bitte geben Sie eine gültige E-Mail Adresse ein" }
						type="email" autoComplete="email webauthn" isRequired
						label="E-Mail" placeholder="name@example.com"
						startContent={ <Mail height="15px" strokeWidth="3" className="text-default-500"/> }
					/>
					<Input
						value={ password } onValueChange={ setPassword }
						isInvalid={ !passwordValid } errorMessage={ passwordValid || "Bitte geben Sie ein gültiges Passwort ein" }
						type={ visible ? "text" : "password" } autoComplete="current-password webauthn" minLength={ 8 } isRequired
						label="Passwort" placeholder="Passwort"
						startContent={ <KeyRound height="15px" strokeWidth="3" className="text-default-500"/> }
						endContent={
							<button className="focus:outline-none" type="button" onClick={ () => setVisible(v => !v) }>
								{ visible
									? <EyeOff className="text-default-500"/>
									: <Eye className="text-default-500"/>
								}
							</button>
						}
					/>
					<Spacer/>
					<Button variant="solid" color="primary" disabled={ !emailValid || !passwordValid } className="font-bold w-full" spinner={ <Spinner/> } isLoading={ state === "loading" } type="submit">Anmelden</Button>

					<ErrorModal error={ error! } isOpen={ isOpen } onOpenChange={ onOpenChange }/>
					{ error &&
						<div className="mt-5 text-danger font-bold w-full text-center cursor-pointer" onClick={ onOpen }>
							Fehler: <ErrorDescription error={ error }/>
						</div>
					}
				</form>
			</CardBody>
		</Card>
	)
}