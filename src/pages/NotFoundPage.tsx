import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";

export default function NotFoundPage() {
	return (
		<>
			<Card className="max-w-[500px] m-auto mt-[5%]" shadow="sm">
				<CardHeader className="text-2xl font-black text-danger flex justify-center">Nicht gefunden</CardHeader>
				<Divider/>
				<CardBody className="text-center px-20 py-7">Diese Seite wurde nicht gefunden!</CardBody>
			</Card>
		</>
	)
}