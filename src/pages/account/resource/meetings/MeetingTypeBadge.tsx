import { Chip } from "@nextui-org/react"
import { MeetingType } from "../../../../types/Meeting.ts"

export default function MeetingTypeBadge({ type, className }: { type: MeetingType, className?: string }) {
	return (
		<Chip classNames={ { content: "font-bold text-white" } } className={ `rounded-lg ${ className ? className : "" } ${ type === "MEETING" ? "bg-danger" : "" } ${ type === "PRACTICE" ? "bg-green-600" : "" }` } color="primary">
			{ type === "MEETING" ? "Treffen" : type === "PRACTICE" ? "Übung" : "Veranstaltung" }
		</Chip>
	)
}