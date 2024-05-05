import styles from "./NavEntry.module.css"

import { ReactNode } from "react";
import { Link, NavbarItem } from "@nextui-org/react";
import { NavLink } from "react-router-dom"
import { useLocation } from "react-router";

export default function NavEntry({ children, path }: { children: ReactNode, path: string }) {
	const location = useLocation()
	const current = path === location.pathname

	return (
		<NavbarItem isActive={ current } className={ `[&>*]:data-[active=true]:before:bg-primary ${ styles.entry }` }>
			<Link color={ current ? undefined : "foreground" } className="before:bg-foreground" as="div">
				<NavLink to={ path }>
					{ children }
				</NavLink>
			</Link>
		</NavbarItem>
	)
}