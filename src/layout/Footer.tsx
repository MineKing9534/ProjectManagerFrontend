import { Divider, Link } from "@nextui-org/react";

export default function Footer() {
	return (
		<footer className="w-full h-[35px] select-none flex-shrink-0">
			<Divider className="absolute"/>
			<div className="z-40 flex px-6 gap-10 w-full flex-row relative flex-nowrap whitespace-nowrap items-center justify-between h-full max-w-full">
				<span className="hidden md:block">© 2024 { import.meta.env._OWNER }</span>
				<div className="flex gap-4 justify-between w-full md:w-fit">
					<Link href={ import.meta.env._IMPRESS } className="text-foreground" target="_blank">Impressum</Link>
					<Link href={ import.meta.env._PRIVACY } className="text-foreground" target="_blank">Datenschutz</Link>
				</div>
				<span className="hidden md:block flex-grow"/>
				<span className="hidden md:block"><Link showAnchorIcon className="text-foreground" target="_blank" href={ `https://github.com/${ import.meta.env._REPOSITORY }` }>{ import.meta.env._REPOSITORY }</Link></span>
			</div>
		</footer>
	)
}