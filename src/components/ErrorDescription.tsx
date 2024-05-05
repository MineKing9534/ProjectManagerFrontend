import { ErrorResponse } from "../types/ErrorResponse.ts";

export default function ErrorDescription({ error }: { error: ErrorResponse }) {
	return (
		<>
			{ (type => {
				switch(type) {
					case "TIMEOUT": return <>Server antwortet nicht</>

					case "INVALID_REQUEST": return <>Ungültige Anfrage</>

					case "MISSING_TOKEN": return <>Fehlende Anmeldeinformationen</>
					case "INVALID_TOKEN": return <>Ungültige Anmeldeinformationen</>
					case "TOKEN_EXPIRED": return <>Anmeldeinformationen abgelaufen</>
					case "MISSING_ACCESS": return <>Kein Zugriff auf diese Funktion</>

					default: return <i>Keine Beschreibung</i>;
				}
			})(error.type) }
		</>
	)
}