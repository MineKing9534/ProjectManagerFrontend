import { Resource } from "../../../../types/Identifiable.ts"
import { useRest } from "../../../../hooks/useRest.ts"
import { PaginationResult } from "../../../../types/PaginationResult.ts"
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import Spinner from "../../../../components/Spinner.tsx"
import { File, Files, FileUp, Folder, FolderPlus, PencilLine, Save, Trash2 } from "lucide-react"
import { useUser } from "../../../../hooks/useUser.ts"
import { useRef, useState } from "react"
import Download from "../../../../components/Download.tsx"
import { FileInfo } from "../../../../types/FileInfo.ts"
import { useDateFormatter } from "@react-aria/i18n"
import BackButton from "../../../../components/BackButton.tsx"
import { useLocation, useNavigate } from "react-router"
import Dropzone from "react-dropzone"
import ErrorModal from "../../../../components/ErrorModal.tsx"

export default function FileList({ resource, className, full = false }: { resource: Resource, className?: string, full?: boolean }) {
	const navigate = useNavigate()
	const user = useUser()!

	const { pathname } = useLocation()

	const currentPath = full ? decodeURI(pathname).split("/").slice(5).join("/") : ""
	const folder = `${ resource.resourceType.toLowerCase() }s/${ resource.id }/files${ currentPath ? `/${ currentPath }` : "" }`

	const { isOpen: isErrorOpen, onOpen: onErrorOpen, onOpenChange: onErrorOpenChange } = useDisclosure()

	const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose, onOpenChange: onRenameOpenChange } = useDisclosure()
	const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose, onOpenChange: onDeleteOpenChange } = useDisclosure()

	const { isOpen: isFileOpen, onOpen: onFileOpen, onClose: onFileClose, onOpenChange: onFileOpenChange } = useDisclosure()
	const { isOpen: isFolderOpen, onOpen: onFolderOpen, onClose: onFolderClose, onOpenChange: onFolderOpenChange } = useDisclosure()

	const [ target, setTarget ] = useState("")
	const [ name, setName ] = useState("")
	const [ file, setFile ] = useState<File>()

	const [ page, setPage ] = useState(1)

	const { state, data, get } = useRest<PaginationResult<FileInfo>>(`/${ folder }?page=${ page }`, { auto: true })
	const { state: editState, error, put, patch, del } = useRest(`/${ folder }`, {
		onSuccess: () => {
			onRenameClose()
			onDeleteClose()
			onFileClose()
			onFolderClose()

			get()
		},
		onError: onErrorOpen
	})

	const formatter = useDateFormatter({ dateStyle: "long", timeStyle: "short" })
	const download = useRef<(url: string) => void>(null)

	return (
		<Card className={ `h-full max-h-full select-none ${ className ? className : "" } ${ !full ? "bg-default-100" : "" }` }>
			<CardHeader className={ `${ full ? "text-3xl" : "text-xl" } font-bold justify-center` }>
				{ full && <BackButton/> }
				Dateien { full && (currentPath ? `/${ currentPath }` : <> für { resource.name }</>) }
			</CardHeader>
			<Divider/>
			<CardBody>
				<Table isHeaderSticky removeWrapper aria-label="Dateien" selectionMode="single" className="h-full" classNames={ { th: `${ !full ? "bg-default-200" : "" }`, td: "group-aria-[selected=false]:group-data-[hover=true]:before:!bg-default-200 " } }>
					<TableHeader>
						<TableColumn key="name">Name</TableColumn>
						<TableColumn key="time" align="end" className="w-[180px]">Zeitstempel</TableColumn>
						{ (full && user.admin) ? <TableColumn key="actions" align="end" className="w-[100px]">Aktionen</TableColumn> : <TableColumn>{ ' ' }</TableColumn> }
					</TableHeader>

					<TableBody
						isLoading={ state === "loading" } loadingContent={ <Spinner/> }
						items={ data?.data || [] } emptyContent="Keine Dateien"
					>
						{ file => (
							<TableRow key={ file.id }>
								<TableCell onClick={ () => {
									if(file.type === "FILE") download.current!(`${ import.meta.env._API }/${ folder }/${ file.name }`)
									else navigate(`/@me/${ folder }/${ file.name }`)
								} }><span className="cursor-pointer flex gap-1 whitespace-nowrap">{ file.type === "FILE" ? <File className="h-[20px]"/> : <Folder className="h-[20px] text-primary"/> } { file.name }</span></TableCell>
								<TableCell className="whitespace-nowrap">{ formatter.format(new Date(file.time)) }</TableCell>
								{ (full && user.admin) ? <TableCell>
									<span className="relative flex items-center gap-2">
										<button className="text-lg text-default-500 hover:opacity-70" onClick={ () => {
											setTarget(file.name)
											setName(file.name)

											onRenameOpen()
										} }>
											<PencilLine height="20px"/>
										</button>

										<button className="text-lg text-danger hover:opacity-70" onClick={ () => {
											setTarget(file.name)
											onDeleteOpen()
										} }>
											<Trash2 height="20px"/>
										</button>
									</span>
								</TableCell> : <TableCell>{ ' ' }</TableCell> }
							</TableRow>
						) }
					</TableBody>
				</Table>
			</CardBody>

			<CardFooter className="flex flex-wrap gap-2 w-full py-2">
				{ (data?.total || 1) > 1 && <div className="w-full flex justify-center">
					<Pagination
						aria-label="Seitenauswahl" isCompact showControls
						page={ page } total={ data?.total || 1 } onChange={ (page) => setPage(page) }
					/>
				</div> }

				{ (user.admin && full) && <div className="w-full flex gap-2 justify-end flex-wrap">
					<Button size="sm" color="primary" className="flex-grow sm:flex-grow-0" onPress={ () => {
						setName("")
						setFile(undefined)
						onFileOpen()
					} } startContent={ <FileUp height="20px" strokeWidth="2.5px"/> }>Datei Hochladen</Button>

					<Button size="sm" color="primary" className="flex-grow sm:flex-grow-0" onPress={ () => {
						setName("")
						onFolderOpen()
					} } startContent={ <FolderPlus height="20px" strokeWidth="2.5px"/> }>Ordner Erstellen</Button>
				</div> }
			</CardFooter>

			<Modal isOpen={ isRenameOpen } onOpenChange={ onRenameOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Umbenennen</ModalHeader>
					<Divider/>
					<ModalBody>
						<Input
							value={ name } onValueChange={ setName } isDisabled={ editState === "loading" }
							type="text" minLength={ 3 } isRequired
							label="Name" placeholder="Information"
							classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
							startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
						/>
					</ModalBody>
					<ModalFooter>
						<Button size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Save strokeWidth="2.5px" height="20px"/> } onPress={ () => {
							patch({ data: { name }, path: `/${ target }` })
						} }>Speichern</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isDeleteOpen } onOpenChange={ onDeleteOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Löschen</ModalHeader>
					<Divider/>
					<ModalBody className="block">
						Soll die Datei / der Ordner <b>{ target }</b> wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!
					</ModalBody>
					<ModalFooter>
						<Button size="sm" color="danger" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <Trash2 strokeWidth="2.5px" height="20px"/> } onPress={ () => {
							del({ path: `/${ target }` })
						} }>Löschen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isFolderOpen } onOpenChange={ onFolderOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Ordner Erstellen</ModalHeader>
					<Divider/>
					<ModalBody>
						<Input
							value={ name } onValueChange={ setName } isDisabled={ editState === "loading" }
							type="text" minLength={ 3 } isRequired
							label="Name" placeholder="Information"
							classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
							startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
						/>
					</ModalBody>
					<ModalFooter>
						<Button size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <FolderPlus strokeWidth="2.5px" height="20px"/> } onPress={ () => {
							put({ path: `/${ name }` })
						} }>Erstellen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Modal isOpen={ isFileOpen } onOpenChange={ onFileOpenChange }>
				<ModalContent>
					<ModalHeader className="py-3 font-bold text-xl">Datei Hochladen</ModalHeader>
					<Divider/>
					<ModalBody>
						{ !file && <Dropzone disabled={ editState === "loading" } multiple={ false } onDrop={ files => {
							setFile(files[0])
							setName(files[0].name)
						} }>
							{ ({ getRootProps, getInputProps }) => (
								<section>
									<div { ...getRootProps() }>
										<input { ...getInputProps() } />
										<button className="w-full h-full text-default-400 font-bold text-lg">
											<Files className="w-[30%] h-[30%] m-auto" strokeWidth="1px"/>
											Datei auswählen
										</button>
									</div>
								</section>
							) }
						</Dropzone> }

						{ file && <Input
							value={ name } onValueChange={ setName } isDisabled={ editState === "loading" }
							type="text" minLength={ 3 } isRequired
							label="Name" placeholder="Information"
							classNames={ { inputWrapper: "!bg-default-100 hover:!bg-default-200" } }
							startContent={ <PencilLine height="15px" strokeWidth="3" className="text-default-500"/> }
						/> }
					</ModalBody>
					<ModalFooter>
						<Button isDisabled={ !file || !name } size="sm" color="primary" isLoading={ editState === "loading" } className="font-bold" spinner={ <Spinner/> } startContent={ <FolderPlus strokeWidth="2.5px" height="20px"/> } onPress={ () => {
							const data = new FormData()
							data.set("file", file!)
							put({ path: `/${ name }`, data })
						} }>Hochladen</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<ErrorModal error={ error! } isOpen={ isErrorOpen } onOpenChange={ onErrorOpenChange }/>

			<Download ref={ download } target="_blank"/>
		</Card>
	)
}