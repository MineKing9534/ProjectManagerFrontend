import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Select, Selection, SelectItem, Tooltip, useDisclosure } from "@nextui-org/react";
import { useRest } from "../../../hooks/useRest.ts";
import { InputData, InputType, IntegerConfig, SelectConfig, StringConfig } from "../../../types/Input.ts";
import ErrorModal from "../../../components/ErrorModal.tsx";
import { File, Hash, PencilLine, Plus, Trash2 } from "lucide-react";
import Spinner from "../../../components/Spinner.tsx";
import { useState } from "react";

export default function CreateInput({ update }: { update: () => void }) {
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()
	const { state, error, post } = useRest<InputData[]>("/inputs", {
		onSuccess: () => update(),
		onError: onErrorOpen
	})

	const { isOpen, onOpen, onOpenChange } = useDisclosure()

	const [ name, setName ] = useState("")
	const [ placeholder, setPlaceholder ] = useState("")
	const [ type, setType ] = useState<Selection>(new Set([ "STRING" ]))
	const [ config, setConfig ] = useState<object>()

	return (
		<>
			<Tooltip content="Weiteres Feld hinzufügen"><Button size="sm" className="w-fit" onPress={ onOpen }><Plus/></Button></Tooltip>

			<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Eingabefeld erstellen</ModalHeader>
					<Divider/>
					<ModalBody className="pt-5 pb-0">
						<Select selectedKeys={ type } onSelectionChange={ s => {
							if (![ ...s ].length) return
							setType(s)
							setConfig(undefined)
						} } isDisabled={ state === "loading" } label="Type" isRequired startContent={ <File height="15px" strokeWidth="3" className="text-default-500"/> }>
							<SelectItem key="STRING">Text</SelectItem>
							<SelectItem key="INTEGER">Zahl</SelectItem>
							<SelectItem key="SELECT">Auswahl</SelectItem>
						</Select>

						<Input
							value={ name } onValueChange={ setName } isDisabled={ state === "loading" }
							type="text" minLength={ 3 } isRequired
							label="Name" placeholder="Geburstag"
							classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
							startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
						/>

						<Input
							value={ placeholder } onValueChange={ setPlaceholder } isDisabled={ state === "loading" }
							type="text" minLength={ 3 }
							label="Platzhalter" placeholder="01.01.1990"
							classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
							startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
						/>

						<Config type={ [ ...type ][0] as never } config={ config } setConfig={ setConfig }/>
					</ModalBody>
					<ModalFooter>
						<Button type="button" isLoading={ state === "loading" } spinner={ <Spinner/> } isDisabled={ name.length < 2 } className="font-bold" size="sm" color="primary" onPress={ () => post({ data: { name, placeholder, type: [ ...type ][0], config } }) }>Erstellen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<ErrorModal error={ error! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>
		</>
	)
}

function Config({ type, config, setConfig }: { type: InputType, config?: object, setConfig: (value?: object) => void }) {
	switch (type) {
		case "STRING": return <StringConfigSettings config={ config as never } setConfig={ setConfig as never }/>
		case "INTEGER": return <IntegerConfigSettings config={ config as never } setConfig={ setConfig as never }/>
		case "SELECT": return <SelectConfigSettings config={ config as never } setConfig={ setConfig as never }/>
	}
}

function StringConfigSettings({ config, setConfig }: { config?: StringConfig, setConfig: (value?: StringConfig) => void }) {
	return (
		<>
			<h2 className="font-bold text-md">Einstellungen</h2>

			<Input
				value={ config?.minLength === undefined ? "" + config?.minLength : "" } onValueChange={ v => setConfig({...config, minLength: v.length ? +v : undefined}) }
				type="number" label="Minimale Länge" placeholder="Keine"
				startContent={ <Hash height="15px" strokeWidth="3" className="text-default-500"/> }
			/>

			<Input
				value={ config?.maxLength === undefined ? "" + config?.maxLength : "" } onValueChange={ v => setConfig({...config, maxLength: v.length ? +v : undefined}) }
				type="number" label="Maximale Länge" placeholder="Keine"
				startContent={ <Hash height="15px" strokeWidth="3" className="text-default-500"/> }
			/>
		</>
	)
}

function IntegerConfigSettings({config, setConfig }: { config?: IntegerConfig, setConfig: (value?: IntegerConfig) => void }) {
	return (
		<>
			<h2 className="font-bold text-md">Einstellungen</h2>

			<Input
				value={ config?.minValue === undefined ? "" + config?.minValue : "" } onValueChange={ v => setConfig({...config, minValue: v.length ? +v : undefined}) }
				type="number" label="Minimaler Wert" placeholder="Keiner"
				startContent={ <Hash height="15px" strokeWidth="3" className="text-default-500"/> }
			/>

			<Input
				value={ config?.maxValue === undefined ? "" + config?.maxValue : "" } onValueChange={ v => setConfig({...config, maxValue: v.length ? +v : undefined}) }
				type="number" label="Maximaler Wert" placeholder="Keiner"
				startContent={ <Hash height="15px" strokeWidth="3" className="text-default-500"/> }
			/>
		</>
	)
}

function SelectConfigSettings({ config, setConfig }: { config?: SelectConfig, setConfig: (value?: SelectConfig) => void }) {
	const [ name, setName ] = useState("")

	return (
		<Card>
			<CardHeader className="font-bold text-md">Mögliche Werte</CardHeader>
			<CardBody>
				<ScrollShadow className="p-0">
					<div className="flex flex-col col-2">
						{ config?.map(value => <div key={ value } className="w-full p-1 hover:bg-default-100 rounded-lg relative pl-2">
							{ value }
							<button className="absolute right-1 text-lg text-danger hover:opacity-70" onClick={ () => setConfig([ ...config ].filter(v => v !== value)) }>
								<Trash2 height="20px"/>
							</button>
						</div>) }

						{ !config?.length && <i>Keine</i> }
					</div>
				</ScrollShadow>
			</CardBody>
			<CardFooter className="gap-2">
				<Input
					size="sm" value={ name } onValueChange={ setName }
					type="text" label="Wert" placeholder="Neuen Wert hinzufügen"
					startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
				/>

				<Button isIconOnly className="w-[48px] h-[48px]" onPress={ () => {
					if (!config?.includes(name)) {
						setConfig([ ...(config || []), name ])
						setName("")
					}
				} }>
					<Plus/>
				</Button>
			</CardFooter>
		</Card>
	)
}