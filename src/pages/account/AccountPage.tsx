import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react"
import { useUser } from "../../hooks/useUser.ts"

export default function AccountPage() {
	const user = useUser()

	return (
		<Card className="h-full max-h-full">
			<CardHeader className="text-3xl font-bold justify-center">Nutzer Informationen</CardHeader>
			<Divider/>
			<CardBody>

			</CardBody>
			<span className="absolute bottom-3 left-3">Ihre ID: <b>{ user?.id }</b></span>
		</Card>
	)
}