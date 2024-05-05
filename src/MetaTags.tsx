export default function MetaTags({ url }:  { url: string }) {
	const path = url.replace(import.meta.env._BASE, "")

	return (
		<>
			<title>{ import.meta.env._TITLE }</title>

			<meta name="theme-color" content={ `#${ import.meta.env._THEME }` }/>
			<meta name="og:image" content={ `${ import.meta.env._URL }/favicon.png` }/>

			<link rel="alternate" type="application/json+oembed" href={ `${ import.meta.env._API }/oembed?url=${ encodeURIComponent(import.meta.env._URL + path) }&format=json` }/>
		</>
	)
}