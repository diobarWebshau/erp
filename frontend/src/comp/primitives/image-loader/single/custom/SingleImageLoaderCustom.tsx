import type { ReactNode } from "react";
import SingleImageLoader from "../base/SingleImageLoader";
import StyleModule from "./SingleImageLoaderCustom.module.css";

interface SingleImageLoaderProps {
    value: File | null;
    onChange: (file: File | null) => void;
    triggerComponent?: (args: { onClick: () => void }) => ReactNode;
    isEditable?: boolean;
}

const SingleImageLoaderCustom = ({
    value,
    onChange,
    triggerComponent,
    isEditable = true
}: SingleImageLoaderProps) => {
    return (
        <SingleImageLoader
            value={value}
            onChange={onChange}
            classNameContainer={StyleModule.container}
            classNameWrapper={StyleModule.wrapper}
            classNamePreviewContainer={StyleModule.previewContainer}
            classNameImageCard={StyleModule.imageCard}
            classNameImage={StyleModule.image}
            classNameActions={StyleModule.actions}
            classNameRemoveButton={StyleModule.removeButton}
            classNameTriggerContainer={StyleModule.triggerContainer}
            classNameRemoveButtonIcon={StyleModule.removeButtonIcon}
            triggerComponent={triggerComponent}
            isEditable={isEditable}
        />
    );
}

export default SingleImageLoaderCustom;