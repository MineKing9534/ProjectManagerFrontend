import { createRoot } from 'react-dom/client'
import App from "./App.tsx"
import { BrowserRouter } from "react-router-dom"

createRoot(document.getElementById("root")!).render(
	<BrowserRouter basename={ import.meta.env._BASE }>
		<App/>
	</BrowserRouter>
)