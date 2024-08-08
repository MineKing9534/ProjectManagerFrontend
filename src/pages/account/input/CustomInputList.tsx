import { useRest } from "../../../hooks/useRest.ts";
import { InputData } from "../../../types/Input.ts";
import { Button, CircularProgress, useDisclosure } from "@nextui-org/react";
import CustomInput from "./CustomInput.tsx";
import { useMap } from "usehooks-ts";
import { User } from "../../../types/User.ts";
import Spinner from "../../../components/Spinner.tsx";
import { Save, Trash2 } from "lucide-react";
import { useUserRequest } from "../../../hooks/useUser.ts";
import ErrorModal from "../../../components/ErrorModal.tsx";
import { FormEvent, useMemo } from "react";
import CreateInput from "./CreateInput.tsx";

function compareMaps<K, V>(a: Omit<Map<K, V>, "set" | "clear" | "delete">, b: Omit<Map<K, V>, "set" | "clear" | "delete">) {
	if (a.size !== b.size) return false;

	for (const [k, v] of a) {
		const v2 = b.get(k);

		if (v !== v2 || (v2 === undefined && !b.has(k))) return false;
	}

	return true;
}

export default function CustomInputList({ user, edit = false, readonly = false }: { user: User, edit?: boolean, readonly?: boolean}) {
	const { get: updateUser } = useUserRequest()!
	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { state, data, error, get, del } = useRest<InputData[]>("/inputs", {
		auto: true,
		onSuccess: data => !data && get(),
		onError: onErrorOpen
	})

	const { state: updateState, error: updateError, post: update } = useRest(`/users/${ user.id }/inputs`, {
		onSuccess: () => updateUser(),
		onError: onErrorOpen
	})

	const userInputs = useMemo(() => new Map(Object.entries(user.inputs)), [ user.inputs ])
	const [ values, actions ] = useMap<string, object>(userInputs)

	function updateInputs(event: FormEvent) {
		event.preventDefault()
		update({ data: { values: Object.fromEntries([ ...values.entries() ].filter(([ key ]) => !!data?.find(i => i.id === key))) } })
	}

	return (
		<>
			{ state === "loading" && <CircularProgress aria-label="Lade Eingabefelder"/> }
			{ (state === "success" && data) && <form onSubmit={ updateInputs } className="flex gap-3 flex-col">
				<h2 className="font-bold text-md">Zusatzinformationen</h2>

				<div className="flex gap-3 flex-col md:flex-row flex-wrap">
					{ data.map(input => <div key={ input.id } className="relative min-w-[30%] flex-grow">
						<CustomInput input={ input } loading={ updateState === "loading" } readonly={ readonly } value={ values.get(input.id) } setValue={ value => value ? actions.set(input.id, value) : actions.remove(input.id) }/>
						{ edit && <button type="button" className="absolute -top-2 -right-2 bg-default-200 rounded-full p-1 hover:bg-default-300" onClick={ () => del({ path: `/${ input.id }` }) }><Trash2 height="15px" width="15px" className="text-danger"/></button> }
					</div> ) }
				</div>

				{ edit && <CreateInput update={ get }/> }

				{ !compareMaps(userInputs, values) && <Button
					isDisabled={ updateState === "loading" } isLoading={ updateState === "loading" } spinner={ <Spinner/> } type="submit"
					className="font-bold md:w-fit" color="primary" startContent={ <Save width="25px"/> } size="sm"
				>
					Speichern
				</Button> }
			</form> }

			<ErrorModal error={ (error || updateError)! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>
		</>
	)
}