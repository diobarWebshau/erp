import CriticalActionButton from "../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import DialogModal from "../../primitives/modal2/dialog-modal/base/DialogModal";
import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import type { StrictStringKeys } from "../../../interfaces/globalTypes";
import styleModule from "./SelectProductsModal.module.css"
import MultiSelectCheckSearchCustomMemo from "../select-check-search/multiple/custom/MultiSelectCheckSearchCustom";

interface SelectObjectsModalProps<T> {
    onClose: () => void,
    onClick: (objects: T[]) => void,
    labelOnClick: string,
    headerTitle: string,

    // ? MultiSelectSearchCheckCustom
    emptyMessage: string,
    attribute: StrictStringKeys<T>,
    placeholder: string,
    loadOptions?: (query: string | number) => Promise<T[]>
    options?: T[]
    maxHeight?: string
}

const SelectObjectsModal = <T,>({
    onClose,
    onClick,
    labelOnClick,
    headerTitle,
    emptyMessage,
    attribute,
    placeholder,
    loadOptions,
    options,
    maxHeight
}: SelectObjectsModalProps<T>) => {

    const [selectedObject, setSelectedObject] = useState<T[]>([]);

    const handlerOnClickButton = useCallback(() => onClick(selectedObject), [onClick, selectedObject]);

    return (
        <DialogModal
            onClose={onClose}
            className={styleModule.containerDialogModal}
            classNameCustomContainer={styleModule.containerDialogModalCustomContainer}
        >
            <div className={styleModule.container}>
                <section className={styleModule.bodySection}>
                    <h2 className={`nunito-semibold ${styleModule.bodySectionH2}`}>
                        {headerTitle}
                    </h2>
                    <MultiSelectCheckSearchCustomMemo
                        rowId={attribute}
                        {...(loadOptions
                            ? { loadOptions }
                            : { options }
                        )}
                        selected={selectedObject}
                        setSelected={setSelectedObject}
                        colorMain="var(--color-theme-primary)"
                        initialOpen={true}
                        emptyMessage={emptyMessage}
                        placeholder={placeholder}
                        maxHeight={maxHeight}
                    />
                </section>
                <section className={styleModule.footerSection}>
                    <CriticalActionButton
                        onClick={onClose}
                        label="Cancelar"
                    />
                    <MainActionButtonCustom
                        onClick={handlerOnClickButton}
                        label={labelOnClick}
                        icon={<Plus />}
                    />
                </section>
            </div >
        </DialogModal >
    );
};

export default SelectObjectsModal;
