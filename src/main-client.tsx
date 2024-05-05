import ReactDOM from 'react-dom/client'

import { BrowserRouter } from "react-router-dom"
import Main from "./Main.tsx"

ReactDOM.hydrateRoot(document.getElementById('root')!,
	<BrowserRouter basename={ import.meta.env._BASE }>
		<Main/>
	</BrowserRouter>
)
