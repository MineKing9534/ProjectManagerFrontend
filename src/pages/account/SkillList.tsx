import { useRest } from "../../hooks/useRest.ts";
import { Skill, SkillGroup } from "../../types/Skill.ts";
import { Accordion, AccordionItem, Button, Card, CardBody, CardFooter, CardHeader, Checkbox, CheckboxGroup, CircularProgress, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Select, Selection, SelectItem, Tooltip, useDisclosure } from "@nextui-org/react";
import { Package, PencilLine, Plus, Trash2 } from "lucide-react";
import Spinner from "../../components/Spinner.tsx";
import { useUserRequest } from "../../hooks/useUser.ts";
import { ReactNode, useState } from "react";
import { User } from "../../types/User.ts";

export default function SkillList({ edit = false, target, className }: { edit?: boolean, target: User, className?: string }) {
	const { get } = useUserRequest()!

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
	const [ current, setCurrent ] = useState("")
	const [ name, setName ] = useState("")
	const [ group, setGroup ] = useState<Selection>(new Set([ "" ]))

	const { isOpen: isGroupOpen, onOpen: onGroupOpen, onOpenChange: onGroupOpenChange, onClose: onGroupClose } = useDisclosure()
	const [ currentGroup, setCurrentGroup ] = useState("")
	const [ groupName, setGroupName ] = useState("")

	const { state: skillState, put } = useRest(`/users/${ target.id }/skills`, {
		onSuccess: () => get()
	})

	const { data: skills, get: updateSkills } = useRest<Skill[]>("/skills", { auto: true })
	const { data: skillGroups, get: updateSkillGroups } = useRest<SkillGroup[]>("/skills/groups", { auto: true })

	const { state: skillUpdateState, post: createSkill, del: deleteSkill, patch: updateSkill } = useRest<Skill>("/skills", {
		onSuccess: () => {
			updateSkills()
			onClose()
		}
	})

	const { state: skillGroupUpdateState, post: createSkillGroup, del: deleteSkillGroup, patch: updateSkillGroup } = useRest<SkillGroup>("/skills/groups", {
		onSuccess: () => {
			updateSkillGroups()
			updateSkills()
			onGroupClose()
		}
	})

	return (
		<Card className={ className }>
			<CardHeader className="text-xl font-bold">Fähigkeiten</CardHeader>
			<CardBody className="pt-1">
				{ !(skillGroups && skills) ? <CircularProgress aria-label="Lade Fähigkeiten" className="m-auto"/> :
					<ScrollShadow className="h-full">
						<CheckboxGroup classNames={ { wrapper: "gap-4" } } isDisabled={ skillState === "loading" } value={ target.skills } onValueChange={ values => put({ data: { skills: values } }) }>
							<Accordion selectionMode="multiple" isCompact className="p-0" defaultExpandedKeys="all">
								{ [ ...(skillGroups || []), ...(skills?.find(s => !s.group) ? [{ id: "", name: "Andere" }] : []) ].map(group =>
									<AccordionItem textValue={ group.name } key={ group.id } classNames={ { content: "pl-3", base: "my-2 [&_*]:max-w-full [&_*]:overflow-hidden", trigger: "py-1.5", heading: "px-3 rounded-lg hover:bg-default-100" } } title={ group.name } HeadingComponent={
										({ children }: { children: ReactNode }) => <span className="flex gap-4">
										{ children }

											{ (edit && group.id) && <span className="flex gap-2">
											<Tooltip content="Umbenennen">
												<button className="text-md text-default-500 hover:opacity-70 flex items-center gap-2" onClick={ () => {
													setCurrentGroup(group.id)
													setGroupName(group.name)
													onGroupOpen()
												} }>
													<PencilLine height="20px"/>
												</button>
											</Tooltip>

											<Tooltip content="Gruppe Entfernen (Elemente bleiben erhalten)">
												<button className="text-md text-danger hover:opacity-70 flex items-center gap-2" onClick={ () => deleteSkillGroup({path: `/${ group.id }`}) }>
													<Trash2 height="20px"/>
												</button>
											</Tooltip>
										</span> }
									</span>
									}>
										<SkillGroupDisplay group={ group } skills={ skills || [] } edit={ edit } del={ skill => deleteSkill({path: `/${ skill.id }`}) } open={ skill => {
											setCurrent(skill.id)
											setName(skill.name)
											setGroup(new Set([ skill.group ]))
											setGroupName("")
											onOpen()
										} }/>
									</AccordionItem>
								) }
							</Accordion>
						</CheckboxGroup>
					</ScrollShadow>
				}

				<Modal isOpen={ isOpen } onOpenChange={ onOpenChange }>
					<ModalContent>
						<ModalHeader className="py-3 font-bold text-xl">Fähigkeit { current ? "Bearbeiten" : "Erstellen" }</ModalHeader>
						<Divider/>
						<form onSubmit={ event => {
							event.preventDefault()

							if(current) {
								if (groupName) createSkillGroup({ data: { name: groupName }, onSuccess: result => updateSkill({ path: `/${ current }`, data: { name, group: result.id } }) })
								else updateSkill({ path: `/${ current }`, data: {name, group: [ ...group ][0] } })
							} else {
								if (groupName) createSkillGroup({ data: { name: groupName }, onSuccess: result => createSkill({ data: { name, group: result.id } }) })
								else createSkill({ data: { name } })
							}
						} }>
							<ModalBody className="pt-5 pb-0">
								<Input
									value={ name } onValueChange={ setName } isDisabled={ skillUpdateState === "loading" }
									type="text" minLength={ 3 } isRequired={ !current }
									label="Name" placeholder="Violine"
									classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
									startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
								/>

								{ skillGroups && <Select
									selectedKeys={ group } onSelectionChange={ s => [ ...s ].length && setGroup(s) }
									label="Gruppe"
									startContent={ <Package height="15px" strokeWidth="3" className="text-default-500"/> }
								>
									{ [ ...skillGroups.map(group => (
										<SelectItem key={ group.id }>{ group.name }</SelectItem>
									)), <SelectItem key="new" textValue="Neue Gruppe Erstellen"><i>Neue Gruppe Erstellen</i></SelectItem>,
										<SelectItem key="" textValue="Keine Gruppe"><i>Keine Gruppe</i></SelectItem>
									] }
								</Select> }

								{ [ ...group ][0] === "new" && <Input
									value={ groupName } onValueChange={ setGroupName }
									type="text" minLength={ 3 }
									label="Name" placeholder="Streicher"
									classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
									startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
								/> }
							</ModalBody>
							<ModalFooter>
								<Button type="submit" isLoading={ skillUpdateState === "loading" } spinner={ <Spinner/> } isDisabled={ name.length < 2 || ([ ...group ][0] === "new" && groupName.length < 2) } className="font-bold" size="sm" color="primary">{ current ? "Speichern" : "Erstellen" }</Button>
							</ModalFooter>
						</form>
					</ModalContent>
				</Modal>
				<Modal isOpen={ isGroupOpen } onOpenChange={ onGroupOpenChange }>
					<ModalContent>
						<ModalHeader className="py-3 font-bold text-xl">Gruppe Bearbeiten</ModalHeader>
						<Divider/>
						<form onSubmit={ event => {
							event.preventDefault()
							updateSkillGroup({
								path: `/${ currentGroup }`,
								data: { name: groupName }
							})
						} }>
							<ModalBody className="pt-5 pb-0">
								<Input
									value={ groupName } onValueChange={ setGroupName } isDisabled={ skillGroupUpdateState === "loading" }
									type="text" minLength={ 3 } isRequired
									label="Name" placeholder="Streicher"
									classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
									startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
								/>
							</ModalBody>
							<ModalFooter>
								<Button type="submit" isLoading={ skillGroupUpdateState === "loading" } spinner={ <Spinner/> } isDisabled={ groupName.length < 2 } className="font-bold" size="sm" color="primary">Bearbeiten</Button>
							</ModalFooter>
						</form>
					</ModalContent>
				</Modal>
			</CardBody>
			<CardFooter className="p-2 flex-shrink-0 justify-end">
				{ edit && <Button size="sm" color="primary" onClick={ () => {
					setCurrent("")
					setName("")
					setGroup(new Set([ "" ]))
					setGroupName("")
					onOpen()
				} } startContent={ <Plus height="20px" strokeWidth="2.5px"/> }>Erstellen</Button> }
			</CardFooter>
		</Card>
	)
}

function SkillGroupDisplay({ group, skills, edit, open, del }: { group: SkillGroup, skills: Skill[], edit: boolean, open: (skill: Skill) => void, del: (skill: Skill) => void }) {
	return skills.filter(s => s.group === group.id).map(skill =>
		<Checkbox key={ skill.id } value={ skill.id } className="max-w-full w-full !m-0 !px-2 !py-1 rounded-lg hover:bg-default-100" classNames={ { label: "flex justify-between w-full before:hidden" } }>
			<span>{ skill.name }</span>
			{ edit &&
				<span className="relative flex items-center gap-2">
					<button className="text-lg text-default-500 hover:opacity-70" onClick={ () => open(skill) }>
						<PencilLine height="20px"/>
					</button>

					<button className="text-lg text-danger hover:opacity-70" onClick={ () => del(skill) }>
						<Trash2 height="20px"/>
					</button>
				</span>
			}
		</Checkbox>
	)
}