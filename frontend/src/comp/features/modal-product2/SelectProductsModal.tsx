import MultiSelectCheckSearchTagCustomMemo from "../select-check-search/multiple/custom/MultiSelectCheckSearchTagCustom";
import CriticalActionButton from "../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import DialogModal from "../../primitives/modal2/dialog-modal/base/DialogModal";
import styleModule from "./SelectProductsModal.module.css"
import { memo, useCallback, useState } from "react";
import { Plus } from "lucide-react";

interface SelectObjectsModalProps<T> {
    onClose: () => void,
    onClick: (objects: T[]) => void,
    labelOnClick: string,
    headerTitle: string,
    // ? MultiSelectSearchCheckCustom
    emptyMessage: string,
    getRowAttr: (data: T) => string,
    placeholder: string,
    loadOptions?: (query: string | number) => Promise<T[]>,
    options?: T[],
    maxHeight?: string,
    label?: string

}

const SelectObjectsModal = <T,>({
    onClose,
    onClick,
    labelOnClick,
    headerTitle,
    emptyMessage,
    getRowAttr,
    placeholder,
    loadOptions,
    options,
    maxHeight,
    label
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
                    <h2 className={`nunito-semibold`}>
                        {headerTitle}
                    </h2>
                    <MultiSelectCheckSearchTagCustomMemo
                        rowId={getRowAttr}
                        {...(loadOptions
                            ? { loadOptions }
                            : { options }
                        )}
                        label={label}
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

const SelectObjectsModalMemo = memo(SelectObjectsModal) as typeof SelectObjectsModal;

export default SelectObjectsModalMemo;
