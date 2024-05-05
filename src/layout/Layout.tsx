import { Outlet } from "react-router";
import Navigation from "./Navigation.tsx";
import Footer from "./Footer.tsx";
import { Suspense } from "react";
import { useRest } from "../hooks/useRest.ts";
import { CircularProgress } from "@nextui-org/react";
import { UserContext, UserRequestContext } from "../hooks/useUser.ts"
import { User } from "../types/User.ts"

export default function Layout() {
	const request = useRest<User>("/@me", { auto: true })

	return (
		<div className="w-screen h-screen gap-4 h-md:gap-12 h-lg:gap-24 flex flex-col items-start justify-center">
			<Navigation user={ request.data }/>
			<div className="w-[95vw] lg:w-[80vw] mx-auto flex-grow flex gap-5 md:gap-20 justify-center flex-col md:flex-row overflow-auto p-5">
				<Suspense fallback={ <CircularProgress className="m-auto" aria-label="Lade Seite"/> }>
					{ request.state === "loading" ? <CircularProgress className="m-auto" aria-label="Lade Nutzer"/> :
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