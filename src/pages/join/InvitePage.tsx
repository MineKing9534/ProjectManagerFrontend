import { lazy, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useNavigate } from "react-router"
import { useUser } from "../../hooks/useUser.ts"
import { useRest } from "../../hooks/useRest.ts"
import { jwtDecode } from "jwt-decode"
import { CircularProgress, useDisclosure } from "@nextui-org/react"
import ErrorModal from "../../components/ErrorModal.tsx"
import { ErrorBoundary } from "react-error-boundary"

const Register = lazy(() => import("./Register.tsx"))

export default function InvitePage() {
	const navigate = useNavigate()

	const [ searchParams ] = useSearchParams()
	const token = searchParams.get("token")

	const user = useUser()

	useEffect(() => {
		if(!token) navigate("/")
	}, [ token ])

	if(token) return (
		<ErrorBoundary fallback={ <Error/> }>
			{ user
				? <Join token={ token }/>
				: <Register token={ token }/>
			}
		</ErrorBoundary>
	)
}

function Error() {
	const navigate = useNavigate()
	useEffect(() => {
		navigate("/")
	}, [])

	return undefined
}

function Join({ token }: { token: string }) {
	const navigate = useNavigate()
	const { sub, type } = jwtDecode<{ sub: string, type: string }>(token)

	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { error, put } = useRest(`/${ type.toLowerCase() }s/${ sub }/users`, {
		onError: onOpen,
		onSuccess: () => navigate(`/@me/${ type.toLowerCase() }s/${ sub }`)
	})

	useEffect(() => {
		put()
	}, [])

	return (
		<>
			<CircularProgress aria-label="Lade" className="m-auto"/>
			<ErrorModal error={ error! } isOpen={ isOpen } onOpenChange={ onOpenChange }/>
		</>
	)
}