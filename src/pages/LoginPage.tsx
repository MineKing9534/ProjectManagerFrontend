import { Button, Card, CardBody, CardHeader, Divider, Input, Spacer, useDisclosure } from "@nextui-org/react"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react"
import { useRest } from "../hooks/useRest.ts"
import Spinner from "../components/Spinner.tsx"
import ErrorModal from "../components/ErrorModal.tsx"
import { useToken } from "../hooks/useToken.ts"
import { useLocation, useNavigate } from "react-router"
import { validateEmail, validatePassword } from "../utils/validate.ts"
import ErrorDescription from "../components/ErrorDescription.tsx"
import { useUser } from "../hooks/useUser.ts"
import { Link } from "react-router-dom"

export default function LoginPage() {
	const user = useUser()

	const { token, setToken } = useToken()
	const location = useLocation()
	const navigate = useNavigate()

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { state, error, post } = useRest<{ token: string }>("/auth/login", {
		onSuccess: data => {
			setToken(data.token)
			navigate(location.state ? location.state : "/@me")
		}
	})

	const [ email, setEmail ] = useState("")
	const emailValid = useMemo(() => validateEmail(email), [ email ])

	const [ password, setPassword ] = useState("")
	const passwordValid = useMemo(() => validatePassword(password), [ password ])

	const [ visible, setVisible ] = useState(false)

	useEffect(() => {
		if(user && token) navigate("/@me")
	}, [ user ])

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
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <Mail height="15px" strokeWidth="3" className="text-default-500"/> }
					/>
					<Input
						value={ password } onValueChange={ setPassword }
						isInvalid={ !passwordValid } errorMessage={ passwordValid || "Bitte geben Sie ein gültiges Passwort ein" }
						type={ visible ? "text" : "password" } autoComplete="current-password webauthn" minLength={ 8 } isRequired
						label="Passwort" placeholder="Passwort"
						classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
						startContent={ <KeyRound height="15px" strokeWidth="3" className="text-default-500"/> }
						endContent={
							<button tabIndex={ -1 } className="focus:outline-none" type="button" onClick={ () => setVisible(v => !v) }>
								{ visible
									? <EyeOff className="text-default-500"/>
									: <Eye className="text-default-500"/>
								}
							</button>
						}
					/>
					<Spacer/>
					<Button variant="solid" color="primary" disabled={ !emailValid || !passwordValid } className="font-bold w-full" spinner={ <Spinner/> } isLoading={ state === "loading" } type="submit">Anmelden</Button>

					<span className="mt-3 flex gap-2">
						Passwort Vergessen?
						<Link to="/reset-password" className="text-primary font-bold">Neues Passwort Erstellen</Link>
					</span>

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