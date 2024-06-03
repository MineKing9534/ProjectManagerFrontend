import { Request, Response } from "express"
import { renderToString } from 'react-dom/server'
import MetaTags from "./MetaTags.tsx"

export function render(req: Request, res: Response, template: string) {
	const meta = renderToString(<MetaTags url={ req.originalUrl }/>)

	res.status(200).header("content-type", "text/html").end(template.replace("<!-- META -->", meta))
}