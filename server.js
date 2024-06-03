import fs from "node:fs/promises"
import express from "express"
import { configDotenv } from "dotenv"

configDotenv({ path: `.env.${ process.env.NODE_ENV }` })

const isProduction = process.env.NODE_ENV === "production"
const port = process.env.PORT || 5173
const clientPort = process.env.PUBLIC_PORT || 443
const base = process.env._BASE || "/"

const app = express()

if(isProduction) {
	const compression = (await import("compression")).default
	const sirv = (await import("sirv")).default

	app.use(compression())
	app.use(base, sirv("./dist/client", { extensions: [] }))

	const template = await fs.readFile("./dist/client/index.html", "utf-8")
	const render = (await import("./dist/server/main-server.js")).render

	app.use("*", async (req, res) => render(req, res, template))
} else {
	const { createServer } = await import("vite")
	const vite = await createServer({
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

	app.use("*", async (req, res) => {
		try {
			const template = await vite.transformIndexHtml(req.originalUrl, await fs.readFile("./index.html", 'utf-8'))
			const render = (await vite.ssrLoadModule("./src/main-server.tsx")).render

			render(req, res, template);
		} catch (e) {
			vite.ssrFixStacktrace(e);
			console.log(e.stack);
			res.status(500).end(e.stack);
		}
	});
}

app.listen(port, () => {
	console.log(`Server started at http://localhost:${ port }${ base }`)
})