import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from "react-router-dom/server"
import MetaTags from "./MetaTags.tsx"
import Main from "./Main.tsx"

export async function render(url: string,) {
	const html = ReactDOMServer.renderToString(
		<StaticRouter location={ url } basename={ import.meta.env._BASE }>
			<Main/>
		</StaticRouter>
	)
	const head = ReactDOMServer.renderToString(<MetaTags url={ url }/>)

	return { html, head }
}