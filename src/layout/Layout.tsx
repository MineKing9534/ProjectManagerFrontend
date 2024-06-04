import { Outlet } from "react-router";
import Navigation from "./Navigation.tsx";
import Footer from "./Footer.tsx";
import { Suspense } from "react";
import { useRest } from "../hooks/useRest.ts";
import { CircularProgress } from "@nextui-org/react";
import { UserContext, UserRequestContext } from "../hooks/useUser.ts"
import { User } from "../types/User.ts"

export default function Layout() {
	const request = useRest<User>("/users/@me", { auto: true })

	return (
		<div className="w-screen h-screen gap-4 h-md:gap-10 flex flex-col items-start justify-center">
			<Navigation user={ request.data }/>
			<div className="w-[95vw] lg:w-[75vw] mx-auto flex-grow flex gap-5 justify-start flex-col overflow-auto p-5">
				<Suspense fallback={ <CircularProgress className="m-auto" aria-label="Lade Seite"/> }>
					{ request.state === "idle" ? <CircularProgress className="m-auto" aria-label="Lade Nutzer"/> :
						<UserContext.Provider value={ request.data }>
							<UserRequestContext.Provider value={ request }>
								<Outlet/>
							</UserRequestContext.Provider>
						</UserContext.Provider>
					}
				</Suspense>
			</div>
			<Footer/>
		</div>
	)
}