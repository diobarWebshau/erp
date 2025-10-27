import StyleModule from "./ImageLoaderCustom.module.css"
import ImageLoader from "../base2/ImageLoader"

interface ImageLoaderCustomProps {
    typeLoader: "multiple" | "single";
    value: File[];
    onChange: (files: File[]) => void;
    isEditable?: boolean
    maxFiles?: number
}

const ImageLoaderCustom = ({
    typeLoader,
    value,
    onChange,
    isEditable = true,
    maxFiles
}: ImageLoaderCustomProps) => {
    return (
        <ImageLoader
            typeLoader={typeLoader}
            value={value}
            onChange={onChange}
            classNameContainer={StyleModule.container}
            classNameWrapper={StyleModule.wrapper}
            classNamePreviewContainer={StyleModule.previewContainer}
            classNameImageCard={StyleModule.imageCard}
            classNameImage={StyleModule.image}
            classNameActions={StyleModule.actions}
            classNameRemoveButton={StyleModule.removeButton}
            classNameEditButton={StyleModule.editButton}
            classNameTriggerContainer={StyleModule.triggerContainer}
            classNameRemoveButtonIcon={StyleModule.removeButtonIcon}
            classNameEditButtonIcon={StyleModule.editButtonIcon}
            isEditable={isEditable}
            maxFiles={maxFiles}
        />
    )
}

export default ImageLoaderCustom
