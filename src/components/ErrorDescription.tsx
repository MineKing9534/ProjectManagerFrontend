import { ErrorResponse } from "../types/ErrorResponse.ts";

export default function ErrorDescription({ error }: { error: ErrorResponse }) {
	return (
		<>
			{ (type => {
				switch(type) {
					case "TIMEOUT": return <>Server antwortet nicht. Überprüfen Sie ihre Internetverbindung oder Versuchen Sie es zu einem späteren Zeitpunkt erneut</>

					case "INVALID_REQUEST": return <>Ihre Anfrage war nicht gültig. Überprüfen Sie ihre Eingabe!</>

					case "MISSING_TOKEN": return <>Sie sind nicht angemeldet. Melden Sie sich zunächst an, bevor Sie diese Seite verwenden können!</>
					case "INVALID_TOKEN": return <>Ungültige Anmeldeinformationen. Wenn der Fehler bestehen bleibt, versuchen Sie die Website-Daten zurück zusetzten</>
					case "TOKEN_EXPIRED": return <>Anmeldeinformationen abgelaufen. Melden Sie sich erneut an, um eine neue Sitzung zu starten!</>
					case "MISSING_ACCESS": return <>Sie haben keinen Zugriff auf diese Aktion!</>

					case "WRONG_PASSWORD": return <>Falsches Passwort</>

					case "SKILL_NOT_FOUND": return <>Fähigkeit nicht gefunden</>
					case "SKILL_ALREADY_EXISTS": return <>Fähigkeit existiert bereits</>
					case "USER_NOT_FOUND": return <>Nutzer nicht gefunden</>
					case "USER_ALREADY_EXISTS": return <>Nutzer existiert bereits</>
					case "TEAM_NOT_FOUND": return <>Team nicht gefunden</>
					case "TEAM_ALREADY_EXISTS": return <>Team existiert bereits</>
					case "MEETING_NOT_FOUND": return <>Veranstaltung nicht gefunden</>
					case "MEETING_ALREADY_EXISTS": return <>Veranstaltung existiert bereits</>

					case "FILE_NOT_FOUND": return <>Die gesuchte Datei wurde nicht gefunden!</>
					case "INVALID_FILE_TYPE": return <>Ungültige Aktion für Dateityp</>

					case "ALREADY_PARTICIPATING": return <>Sie nehmen bereits teil!</>
					case "PARTICIPANT_NOT_FOUND": return <>Teilnehmern nicht gefunden</>

					default: return <i>Keine Beschreibung</i>;
				}
			})(error.type) }
		</>
	)
}