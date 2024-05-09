import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/react";
import { useToken } from "../hooks/useToken.ts";
import { useLocation, useNavigate } from "react-router";
import { User } from "../types/User.ts"
import { Book, CalendarDays, LogOut, Users } from "lucide-react"

export default function UserInfo({ user }: { user: User }) {
	const { pathname } = useLocation()
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
				<DropdownMenu aria-label="Nutzer Optionen" variant="solid">
					<DropdownSection showDivider>
						<DropdownItem className="h-14 gap-2" textValue="Nutzer Info" onClick={ () => navigate("/@me") }>
							<p className="font-semibold">Aktuell angemeldet als</p>
							<p className="font-semibold text-primary">{ user.email }</p>
						</DropdownItem>
					</DropdownSection>

					<DropdownSection showDivider>
						{ (user.admin && <DropdownItem startContent={ <Users width="20px"/> } className={ pathname === "/@me/users" ? "[&>span]:font-bold" : "" } onClick={ () => navigate("/@me/users") }>Nutzerliste</DropdownItem>) as never }
						<DropdownItem startContent={ <CalendarDays width="20px"/> } className={ pathname === "/@me/meetings" ? "[&>span]:font-bold" : "" } onClick={ () => navigate("/@me/meetings") }>Veranstaltungen</DropdownItem>
						<DropdownItem startContent={ <Book width="20px"/> } className={ pathname === "/@me/teams" ? "[&>span]:font-bold" : "" } onClick={ () => navigate("/@me/teams") }>Teams</DropdownItem>
					</DropdownSection>

					<DropdownItem startContent={ <LogOut width="20px"/> } color="danger" onPress={ () => {
						setToken("")
						navigate("/")
					} }>Abmelden</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</>
	)
}