import { Route, Routes } from "react-router";
import { lazy } from "react";
import Layout from "./layout/Layout.tsx"

const HomePage = lazy(() => import("./pages/HomePage.tsx"))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"))

export default function App() {
	return (
		<Routes>
			<Route path="/" element={ <Layout/> }>
				<Route path="/" element={ <HomePage/> }/>

				<Route path="*" element={ <NotFoundPage/> }/>
			</Route>
		</Routes>
	)
}