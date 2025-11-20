import TransparentButtonCustom from "../../../button/custom-button/transparent/TransparentButtonCustom";
import StyleModule from "./SingleImageLoader.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { ReactNode } from "react";
import clsx from "clsx";

interface SingleImageLoaderProps {
    value: File | null;
    onChange: (file: File | null) => void;
    classNameContainer?: string;
    classNameWrapper?: string;
    classNamePreviewContainer?: string;
    classNameImageCard?: string;
    classNameImage?: string;
    classNameActions?: string;
    classNameRemoveButton?: string;
    classNameTriggerContainer?: string;
    classNameRemoveButtonIcon?: string;
    triggerComponent?: (args: { onClick: () => void }) => ReactNode;
    isEditable?: boolean;
}

const SingleImageLoader = ({
    value,
    onChange,
    classNameContainer,
    classNameWrapper,
    classNamePreviewContainer,
    classNameImageCard,
    classNameImage,
    classNameActions,
    classNameRemoveButton,
    classNameTriggerContainer,
    classNameRemoveButtonIcon,
    triggerComponent,
    isEditable = true
}: SingleImageLoaderProps) => {

    const inputFileRef = useRef<HTMLInputElement>(null);

    // El file seleccionado (solo 1)
    const [file, setFile] = useState<File | null>(value || null);

    // Url temporal para <img>
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const selected = e.target.files[0];
        setFile(selected);
        onChange(selected);
        e.target.value = "";
    }, [onChange]);
    const handleRemove = useCallback(() => {
        setFile(null);
        setPreview(null);
        onChange(null);
    }, [onChange]);

    const handleUpload = useCallback(() => {
        inputFileRef.current?.click();
    }, []);

    // Genera/limpia Object URL
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div className={clsx(StyleModule.container, classNameContainer)}>
            <input
                type="file"
                accept="image/*"
                className={StyleModule.inputFile}
                ref={inputFileRef}
                onChange={handleFileChange}
            />
            {preview && (
                <div className={clsx(StyleModule.wrapper, classNameWrapper)}>
                    <div className={clsx(StyleModule.previewContainer, classNamePreviewContainer)}>
                        <div className={clsx(StyleModule.imageCard, classNameImageCard)}>
                            <img
                                src={preview}
                                alt="preview"
                                className={clsx(StyleModule.image, classNameImage)}
                            />
                            {isEditable && (
                                <div className={clsx(StyleModule.actions, classNameActions)}>
                                    <button
                                        type="button"
                                        className={clsx(StyleModule.removeButton, classNameRemoveButton)}
                                        onClick={handleRemove}
                                    >
                                        <X className={clsx(StyleModule.removeButtonIcon, classNameRemoveButtonIcon)} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {!value && (
                <div className={clsx(StyleModule.triggerContainer, classNameTriggerContainer)}>
                    {triggerComponent ? (
                        triggerComponent({ onClick: handleUpload })
                    ) : (
                        <TransparentButtonCustom
                            typeOrderIcon="last"
                            label={preview ? "Reemplazar fotografía" : "Cargar fotografía"}
                            onClick={handleUpload}
                            icon={<Upload />}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default SingleImageLoader;
