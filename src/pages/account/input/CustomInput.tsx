import { InputData, IntegerConfig, SelectConfig, StringConfig } from "../../../types/Input.ts";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { Hash, Menu, PencilLine } from "lucide-react";

export default function CustomInput({ input, loading, readonly, value, setValue }: { input: InputData, loading: boolean, readonly: boolean, value?: object, setValue: (value: object) => void }) {
	switch (input.type) {
		case "STRING": return <StringInput input={ input } loading={ loading } readonly={ readonly } value={ value as never } setValue={ setValue as never }/>
		case "INTEGER": return <IntegerInput input={ input } loading={ loading } readonly={ readonly } value={ value as never } setValue={ setValue as never }/>
		case "SELECT": return <SelectInput input={ input } loading={ loading } readonly={ readonly } value={ value as never } setValue={ setValue as never }/>
	}
}

function StringInput({ input, loading, readonly, value, setValue }: { input: InputData, loading: boolean, readonly: boolean, value?: string, setValue: (value: string) => void }) {
	const config = JSON.parse(input.config) as StringConfig

	return (
		<Input
			value={ value || "" } onValueChange={ setValue } isDisabled={ loading } isReadOnly={ readonly }
			type="text" label={ input.name } placeholder={ input.placeholder }
			minLength={ config.minLength } maxLength={ config.maxLength }
			startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
		/>
	)
}

function IntegerInput({ input, loading, readonly, value, setValue }: { input: InputData, loading: boolean, readonly: boolean, value?: number, setValue: (value: number) => void }) {
	const config = JSON.parse(input.config) as IntegerConfig

	return (
		<Input
			value={ "" + (value || 0) } onValueChange={ v => setValue(+v) } isDisabled={ loading } isReadOnly={ readonly }
			type="number" label={ input.name } placeholder={ input.placeholder }
			min={ config.minValue } max={ config.maxValue }
			startContent={ <Hash height="15px" strokeWidth="3" className="text-default-500"/> }
		/>
	)
}

function SelectInput({ input, loading, readonly, value, setValue }: { input: InputData, loading: boolean, readonly: boolean, value?: string, setValue: (string: object) => void }) {
	const config = JSON.parse(input.config) as SelectConfig

	return (
		<Select
			selectedKeys={ new Set(value ? [ value ] : []) } onSelectionChange={ s => [ ...s ].length ? setValue([ ...s ][0] as never) : setValue("" as never) } isDisabled={ loading || readonly }
			label={ input.name } placeholder={ input.placeholder }
			startContent={ <Menu height="15px" strokeWidth="3" className="text-default-500"/> }
		>
			{ config.map(value => <SelectItem key={ value }>{ value }</SelectItem>) }
		</Select>
	)
}