import fs from "node:fs/promises"
import express from "express"
import { configDotenv } from "dotenv"

configDotenv({ path: `.env.${ process.env.NODE_ENV }` })

const isProduction = process.env.NODE_ENV === "production"
const port = process.env.PORT || 5173
const clientPort = process.env.PUBLIC_PORT || 443
const base = process.env._BASE || "/"

const templateHtml = isProduction
	? await fs.readFile("./dist/client/index.html", "utf-8")
	: ""

const ssrManifest = isProduction
	? await fs.readFile("./dist/client/.vite/ssr-manifest.json", "utf-8")
	: undefined

const app = express()

let vite
if(!isProduction) {
	const { createServer } = await import("vite")
	vite = await createServer({
		server: {
			middlewareMode: true,
			strictPort: true,
			hmr: {
				clientPort: clientPort,
				path: "hmr",
				port: +port + 1
			}
		},
		appType: "custom",
		base
	})

	app.use(vite.middlewares)
} else {
	const compression = (await import("compression")).default
	const sirv = (await import("sirv")).default

	app.use(compression())
	app.use(sirv("./dist/client", { extensions: [] }))
}

app.use("*", async(req, res) => {
	try {
		const url = req.originalUrl

		let template
		let render

		if(!isProduction) {
			template = await fs.readFile("./index.html", "utf-8")
			template = await vite.transformIndexHtml(url, template)
			render = (await vite.ssrLoadModule("/src/main-server.tsx")).render
		} else {
			template = templateHtml
			render = (await import("./dist/server/main-server.js")).render
		}

		const rendered = await render(url, ssrManifest)

		const html = template
			.replace(`<!--app-head-->`, rendered.head ?? '')
			.replace(`<!--app-html-->`, rendered.html ?? '')

		res.status(200)
			.set({ 'Content-Type': 'text/html' })
			.send(html)
	} catch(e) {
		vite?.ssrFixStacktrace(e)
		console.log(e.stack)
		res.status(500).end(e.stack)
	}
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${ port }${ base }`)
})