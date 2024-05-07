import { Route, Routes } from "react-router";
import { lazy } from "react";
import Layout from "./layout/Layout.tsx"

const LoginPage = lazy(() => import("./pages/LoginPage.tsx"))
const AccountPage = lazy(() => import("./pages/AccountPage.tsx"))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"))

export default function App() {
	return (
		<Routes>
			<Route path="/" element={ <Layout/> }>
				<Route path="/" element={ <LoginPage/> }/>
				<Route path="/@me" element={ <AccountPage/> }/>

				<Route path="*" element={ <NotFoundPage/> }/>
			</Route>
		</Routes>
	)
}