import { useNavigate } from "react-router"
import { Button, Card, CardBody, CardHeader, Divider, Input, Spacer, useDisclosure } from "@nextui-org/react"
import { useRest } from "../../hooks/useRest.ts"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { validatePassword } from "../../utils/validate.ts"
import { Eye, EyeOff, KeyRound } from "lucide-react"
import Spinner from "../../components/Spinner.tsx"
import ErrorModal from "../../components/ErrorModal.tsx"
import ErrorDescription from "../../components/ErrorDescription.tsx"
import { useSearchParams } from "react-router-dom"

export default function VerificationPage() {
	const navigate = useNavigate()

	const [ searchParams ] = useSearchParams()
	const token = searchParams.get("token")

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { state, error, post } = useRest("/users/verify", {
		authorization: token || undefined,
		onSuccess: () => navigate("/")
	})

	const [ password1, setPassword1 ] = useState("")
	const password1Valid = useMemo(() => validatePassword(password1), [ password1 ])

	const [ password2, setPassword2 ] = useState("")
	const password2Valid = useMemo(() => password1 === password2, [ password1, password2 ])

	const [ visible, setVisible ] = useState(false)

	function register(event: FormEvent) {
		event.preventDefault()

		if(!password1Valid || !password2Valid) return
		post({ data: { password: password1 } })
	}

	useEffect(() => {
		if(!token) navigate("/")
	}, [ token ])

	return (
		<Card className="w-full md:w-2/3 mx-auto select-none">
			<CardHeader className="text-3xl font-bold justify-center">Anmelden</CardHeader>
			<Divider/>
			<CardBody>
				<form className="flex flex-col gap-2 p-2" onSubmit={ register }>
					<Input
						value={ password1 } onValueChange={ setPassword1 }
						isInvalid={ !password1Valid } errorMessage={ password1Valid || "Bitte geben Sie ein gültiges Passwort ein" }
						type={ visible ? "text" : "password" } autoComplete="new-password" minLength={ 8 } isRequired
						label="Password" placeholder="Passwort"
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
					<Input
						value={ password2 } onValueChange={ setPassword2 }
						isInvalid={ !password2Valid } errorMessage={ password2Valid || "Passwörter stimmen nicht überein" }
						type={ visible ? "text" : "password" } minLength={ 8 } isRequired
						label="Passwort Wiederholen" placeholder="Passwort"
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
					<Button variant="solid" color="primary" disabled={ !password1Valid || !password2Valid } className="font-bold w-full" spinner={ <Spinner/> } isLoading={ state === "loading" } type="submit">Abschließen</Button>

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