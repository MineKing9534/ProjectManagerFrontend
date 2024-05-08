import { Link, Navbar, NavbarBrand, NavbarContent, Switch } from "@nextui-org/react";
import { NavLink } from "react-router-dom"
import icon from "../assets/icon.svg"
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode.ts";
import { lazy, Suspense, useEffect } from "react";
import { User } from "../types/User.ts"

const UserInfo = lazy(() => import("./UserInfo.tsx"));

export default function Navigation({ user }: { user?: User }) {
	const { darkMode, setDarkMode } = useDarkMode()

	useEffect(() => {
		if(darkMode) document.body.classList.add("dark")
		else document.body.classList.remove("dark")
	}, [ darkMode ])

	return (
		<Navbar maxWidth="full" height="50px" className="select-none" isBordered>
			<NavbarBrand>
				<Link color="foreground" as="div">
					<NavLink to="/" className="gap-2 relative inline-flex items-center tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-medium text-foreground no-underline hover:opacity-80 active:opacity-disabled transition-opacity">
						<img src={ icon } className="h-[25px]"/>
						<p className="font-bold text-inherit text-lg">{ import.meta.env._TITLE }</p>
					</NavLink>
				</Link>
			</NavbarBrand>

			<NavbarContent justify="end">
				<Switch
					size="md" color="success"
					startContent={ <Sun/> }
					endContent={ <Moon/> }
					isSelected={ darkMode } onValueChange={ setDarkMode }
				/>
				<Suspense>
					{ user && <UserInfo user={ user }/> }
				</Suspense>
			</NavbarContent>
		</Navbar>
	)
}