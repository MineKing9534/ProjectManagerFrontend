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

					case "WRONG_PASSWORD": return <>Falsches Passwort</>

					case "SKILL_NOT_FOUND": return <>Fähigkeit nicht gefunden</>
					case "SKILL_ALREADY_EXISTS": return <>Fähigkeit existiert bereits</>
					case "USER_NOT_FOUND": return <>Nutzer nicht gefunden</>
					case "USER_ALREADY_EXISTS": return <>Nutzer existiert bereits</>
					case "TEAM_NOT_FOUND": return <>Team nicht gefunden</>
					case "TEAM_ALREADY_EXISTS": return <>Team existiert bereits</>
					case "MEETING_NOT_FOUND": return <>Treffen nicht gefunden</>
					case "MEETING_ALREADY_EXISTS": return <>Treffen existiert bereits</>

					case "ALREADY_PARTICIPATING": return <>Sie nehmen bereits teil!</>
					case "PARTICIPANT_NOT_FOUND": return <>Teilnehmern nicht gefunden</>

					default: return <i>Keine Beschreibung</i>;
				}
			})(error.type) }
		</>
	)
}