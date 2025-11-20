
import StyleModule from "./imageLoader.module.css"
import TransparentButtonCustom from "../../button/custom-button/transparent/TransparentButtonCustom";
import { Upload, X } from "lucide-react";
// import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { ReactNode } from "react";
import ToastMantine from "../../../../comp/external/mantine/toast/base/ToastMantine";

interface ImageLoaderProps {
    typeLoader: "multiple" | "single";
    value: File[];
    onChange: (files: File[]) => void;
    classNameContainer?: string;
    classNameWrapper?: string;
    classNamePreviewContainer?: string;
    classNameImageCard?: string;
    classNameImage?: string;
    classNameActions?: string;
    classNameRemoveButton?: string;
    classNameEditButton?: string;
    classNameTriggerContainer?: string;
    classNameRemoveButtonIcon?: string;
    classNameEditButtonIcon?: string;
    triggerComponent?: (args: { onClick: () => void }) => ReactNode;
    isEditable?: boolean
    maxFiles?: number
}

const ImageLoader = ({
    typeLoader,
    value,
    onChange,
    classNameContainer,
    classNameWrapper,
    classNamePreviewContainer,
    classNameImageCard,
    classNameImage,
    classNameActions,
    classNameRemoveButton,
    // classNameEditButton,
    classNameTriggerContainer,
    classNameRemoveButtonIcon,
    // classNameEditButtonIcon,
    triggerComponent,
    isEditable = true,
    maxFiles
}: ImageLoaderProps) => {

    // Referencia al <input type="file"> para invocarlo programáticamente (click())
    const inputFileRef = useRef<HTMLInputElement>(null);
    // Estado fuente de la verdad: los File que el usuario seleccionó (o venían en initialFiles)
    const [files, setFiles] = useState<File[]>(value || []);
    // Estado con URLs temporales para mostrar <img src=...> (derivadas de files)
    const [previews, setPreviews] = useState<string[]>([]);
    /**
     * replaceIndex indica si estamos en "modo reemplazo":
     * - null  => modo añadir (se permite seleccionar múltiples si multiple=true)
     * - número => índice de la imagen a reemplazar (solo se toma el 1er archivo del input)
     */
    const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

    /**
     * Handler cuando el usuario selecciona archivos en el <input type="file">
     * - Si replaceIndex !== null => reemplaza solo el archivo en esa posición.
     * - Si replaceIndex === null => añade (o reemplaza todo si multiple=false).
     * - Limpia e.target.value para permitir re-seleccionar el MISMO archivo consecutivamente.
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Si no hay archivos seleccionados, no hacemos nada
        if (!e.target.files || e.target.files.length === 0) return;

        const newFiles: File[] = Array.from(e.target.files);
        let updatedFiles: File[];

        if (replaceIndex !== null) {
            // Modo "reemplazo" de un archivo puntual (toma el primero de newFiles)
            updatedFiles = [...files];
            updatedFiles[replaceIndex] = newFiles[0];
            setReplaceIndex(null); // Salimos del modo reemplazo
        } else {
            // Modo "añadir"
            // - Si multiple=true: concatena los nuevos
            // - Si multiple=false: reemplaza por completo (solo se puede tener 1)
            updatedFiles = typeLoader === "multiple" ? [...files, ...newFiles] : newFiles;
            // Validación de cantidad máxima
            if (maxFiles && updatedFiles.length > maxFiles) {
                ToastMantine.feedBackForm({
                    message: `Solo puedes seleccionar hasta ${maxFiles} imagen(es).`,
                });
                e.target.value = "";
                return;
            }
        }

        setFiles(updatedFiles);   // Actualiza el estado interno
        onChange(updatedFiles);   // Notifica al padre el nuevo arreglo

        // Permite que el usuario seleccione de nuevo el mismo archivo sin que el input lo ignore
        e.target.value = "";
    };

    /**
     * Elimina el archivo en la posición `index` (y notifica arriba).
     */
    const handleRemove = (index: number) => () => {
        const updated = [...files];
        updated.splice(index, 1);
        setFiles(updated);
        onChange(updated);
    };

    /**
     * Entra en "modo reemplazo" para el índice indicado
     * y programa un click() sobre el input para abrir el diálogo de archivos.
     */
    // const handleReplace = (index: number) => () => {
    //     setReplaceIndex(index);
    //     inputFileRef.current?.click();
    // };

    const handleUpload = () => {
        setReplaceIndex(null);
        inputFileRef.current?.click();
    };

    /**
     * Efecto que:
     * 1) Genera las object URLs de cada File actual (files)
     * 2) Actualiza previews para que las <img> apunten a esas URLs
     * 3) Limpia (revokeObjectURL) las URLs anteriores para evitar fugas de memoria
     *
     * Nota: este useEffect depende de `files`.
     */
    useEffect(() => {
        // Genera las object URLs de cada File actual (files)
        const objectUrls = files.map(file => URL.createObjectURL(file));
        // Actualiza previews para que las <img> apunten a esas URLs
        setPreviews(objectUrls);
        // cleanup: revocar las URLs anteriores cuando cambie `files` o se desmonte el componente
        return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
    }, [files]);

    return (
        <div className={clsx(StyleModule.container, classNameContainer)}>
            <input
                type="file"
                accept="image/*"
                multiple={typeLoader === "multiple"}
                className={StyleModule.inputFile}
                ref={inputFileRef}
                onChange={handleFileChange}
            />
            {previews?.length > 0 &&
                <div className={clsx(StyleModule.wrapper, classNameWrapper)}>
                    <div className={clsx(StyleModule.previewContainer, classNamePreviewContainer)}>
                        {previews.map((url, index) => (
                            <div key={index} className={clsx(StyleModule.imageCard, classNameImageCard)}>
                                <img
                                    src={url}
                                    alt={`preview-${index}`}
                                    className={clsx(StyleModule.image, classNameImage)}
                                />
                                {
                                    isEditable ?
                                        <div className={clsx(StyleModule.actions, classNameActions)}>
                                            <button
                                                type="button"
                                                className={clsx(StyleModule.removeButton, classNameRemoveButton)}
                                                onClick={handleRemove(index)}
                                            >
                                                <X className={clsx(StyleModule.removeButtonIcon, classNameRemoveButtonIcon)} />
                                            </button>
                                            {/* {typeLoader === "multiple" && (
                                                <button
                                                    type="button"
                                                    className={clsx(StyleModule.editButton, classNameEditButton)}
                                                    onClick={handleReplace(index)}
                                                >
                                                    <Pencil className={clsx(StyleModule.editButtonIcon, classNameEditButtonIcon)} />
                                                </button>
                                            )} */}
                                        </div>
                                        : null
                                }
                            </div>
                        ))}
                    </div>
                </div>
            }
            {
                isEditable ?
                    <div className={clsx(StyleModule.triggerContainer, classNameTriggerContainer)}>
                        {triggerComponent ? triggerComponent({ onClick: handleUpload }) : (
                            <TransparentButtonCustom
                                typeOrderIcon="last"
                                label="Cargar fotografias "
                                onClick={handleUpload}
                                icon={<Upload />}
                            />
                        )}
                    </div>
                    : null
            }
        </div>
    )
}

export default ImageLoader



// import StyleModule from "./imageLoader.module.css"
// import TransparentButtonCustom from "../../button/custom-button/transparent/TransparentButtonCustom";
// import { Pencil, Upload, X } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom"; // ✅ portal para overlay

// interface ImageLoaderProps {
//     typeLoader: "multiple" | "single";
//     value: File[];
//     onChange: (files: File[]) => void;
// }

// type ZoomState = null | {
//     src: string;
//     rect: DOMRect;
//     scale: number;
// };

// const ImageLoader = ({
//     typeLoader,
//     value,
//     onChange
// }: ImageLoaderProps) => {

//     const inputFileRef = useRef<HTMLInputElement>(null);
//     const [files, setFiles] = useState<File[]>(value || []);
//     const [previews, setPreviews] = useState<string[]>([]);
//     const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

//     // ✅ Estado del overlay
//     const [zoom, setZoom] = useState<ZoomState>(null);

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (!e.target.files || e.target.files.length === 0) return;

//         const newFiles: File[] = Array.from(e.target.files);
//         let updatedFiles: File[];

//         if (replaceIndex !== null) {
//             updatedFiles = [...files];
//             updatedFiles[replaceIndex] = newFiles[0];
//             setReplaceIndex(null);
//         } else {
//             updatedFiles = typeLoader === "multiple" ? [...files, ...newFiles] : newFiles;
//         }

//         setFiles(updatedFiles);
//         onChange(updatedFiles);
//         e.target.value = "";
//     };

//     const handleRemove = (index: number) => () => {
//         const updated = [...files];
//         updated.splice(index, 1);
//         setFiles(updated);
//         onChange(updated);
//     };

//     const handleReplace = (index: number) => () => {
//         setReplaceIndex(index);
//         inputFileRef.current?.click();
//     };

//     const handleUpload = () => {
//         setReplaceIndex(null);
//         inputFileRef.current?.click();
//     };

//     useEffect(() => {
//         const objectUrls = files.map(file => URL.createObjectURL(file));
//         setPreviews(objectUrls);
//         return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
//     }, [files]);

//     // ✅ Handlers de hover para crear el overlay sin tocar overflow del contenedor
//     const onCardEnter = (e: React.MouseEvent<HTMLDivElement>, src: string) => {
//         const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//         setZoom({ src, rect, scale: 1.5 });
//     };
//     const onCardLeave = () => setZoom(null);

//     return (
//         <div className={StyleModule.container}>
//             <input
//                 type="file"
//                 accept="image/*"
//                 multiple={typeLoader === "multiple"}
//                 className={StyleModule.inputFile}
//                 ref={inputFileRef}
//                 onChange={handleFileChange}
//             />

//             <div className={StyleModule.wrapper}>
//                 <div className={StyleModule.previewContainer}>
//                     {files.map((file, index) => {
//                         const src = previews[index]; // ✅ usamos tus previews (ya gestionan revoke)
//                         if (!src) return null;
//                         return (
//                             <div
//                                 key={index}
//                                 className={StyleModule.imageCard}
//                                 onMouseEnter={(e) => onCardEnter(e, src)} // ✅ activa overlay
//                                 onMouseLeave={onCardLeave}               // ✅ desactiva overlay
//                             >
//                                 <img
//                                     src={src}
//                                     alt={`preview-${index}`}
//                                     className={StyleModule.image}
//                                 />
//                                 <div className={StyleModule.actions}>
//                                     <button
//                                         type="button"
//                                         className={StyleModule.removeButton}
//                                         onClick={handleRemove(index)}
//                                     >
//                                         <X size={14} />
//                                     </button>
//                                     {typeLoader === "multiple" && (
//                                         <button
//                                             type="button"
//                                             className={StyleModule.editButton}
//                                             onClick={handleReplace(index)}
//                                         >
//                                             <Pencil size={14} />
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>

//             <div className={StyleModule.triggerContainer}>
//                 <TransparentButtonCustom
//                     typeOrderIcon="last"
//                     label="Cargar fotografias "
//                     onClick={handleUpload}
//                     icon={<Upload />}
//                 />
//             </div>

//             {/* ✅ Portal del overlay: no lo recorta ningún overflow del layout */}
//             {zoom && createPortal(
//                 <div className={StyleModule.zoomOverlay} aria-hidden>
//                     <img
//                         className={StyleModule.zoomImage}
//                         src={zoom.src}
//                         alt=""
//                         style={{
//                             left: `${zoom.rect.left}px`,
//                             top: `${zoom.rect.top}px`,
//                             width: `${zoom.rect.width}px`,
//                             height: `${zoom.rect.height}px`,
//                             transform: `translateZ(0) scale(${zoom.scale})`,
//                         }}
//                     />
//                 </div>,
//                 document.body
//             )}
//         </div>
//     )
// }

// export default ImageLoader
