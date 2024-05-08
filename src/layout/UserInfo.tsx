import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { useToken } from "../hooks/useToken.ts";
import { useNavigate } from "react-router";
import { User } from "../types/User.ts"

export default function UserInfo({ user }: { user: User }) {
	const navigate = useNavigate()
	const { setToken } = useToken()

	return (
		<>
			<Dropdown placement="bottom-end">
				<DropdownTrigger>
					<Avatar
						isBordered as="button" className="transition-transform"
						color="primary" size="sm"
						src={ undefined }
					/>
				</DropdownTrigger>
				<DropdownMenu aria-label="Nutzer Optionen" variant="flat">
					<DropdownItem className="h-14 gap-2" textValue="Nutzer Info" onClick={ () => navigate("/@me") }>
						<p className="font-semibold">Aktuell angemeldet als</p>
						<p className="font-semibold text-primary">{ user.email }</p>
					</DropdownItem>

					<DropdownItem onClick={ () => navigate("/@me/meetings") }>Treffen</DropdownItem>
					<DropdownItem onClick={ () => navigate("/@me/teams") }>Teams</DropdownItem>

					<DropdownItem color="danger" onPress={ () => {
						setToken("")
						navigate("/")
					} }>Abmelden</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</>
	)
}