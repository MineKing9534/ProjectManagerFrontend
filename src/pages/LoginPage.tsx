import { Button, Input, Spacer, useDisclosure } from "@nextui-org/react"
import { useState } from "react"
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react"
import { useRest } from "../hooks/useRest.ts"
import Spinner from "../components/Spinner.tsx"
import ErrorModal from "../components/ErrorModal.tsx"
import { useToken } from "../hooks/useToken.ts"
import { useNavigate } from "react-router"

export default function LoginPage() {
	const { setToken } = useToken()
	const naviagate = useNavigate()

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { state, error, post } = useRest<{ token: string }>("/login", {
		onError: onOpen,
		onSuccess: data => {
			setToken(data.token)
			naviagate("/@me")
		}
	})

	const [ email, setEmail ] = useState("")
	const [ password, setPassword ] = useState("")

	const [ visible, setVisible ] = useState(false)

	function login() {
		post({ data: { email, password } })
	}

	return (
		<div className="flex flex-col gap-5 w-full md:w-2/3 mx-auto">
			<Input
				value={ email } onValueChange={ setEmail }
				type="email" autoComplete="email" isRequired
				label="E-Mail" placeholder="name@example.com"
				startContent={ <Mail height="15px" strokeWidth="3" className="text-default-500"/> }
			/>
			<Input
				value={ password } onValueChange={ setPassword }
				type={ visible ? "text" : "password" } autoComplete="new-password" minLength={ 8 } isRequired
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
			<Button color="primary" className="font-bold" spinner={ <Spinner/> } isLoading={ state === "loading" } onClick={ login }>Anmelden</Button>

			<ErrorModal error={ error! } isOpen={ isOpen } onOpenChange={ onOpenChange }/>
		</div>
	)
}