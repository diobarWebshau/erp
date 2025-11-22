import CriticalActionButton from "../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import DialogModal from "../../primitives/modal2/dialog-modal/base/DialogModal";
import { useState } from "react";
import { Plus } from "lucide-react";
import styleModule from "./SelectProductsModal.module.css"
import MultiSelectCheckSearchCustomMemo from "../select-check-search/multiple/custom/MultiSelectCheckSearchCustom";

interface SelectObjectsModalProps<T> {
    onClose: () => void,
    onClick: (objects: T[]) => void,
    labelOnClick: string,
    headerTitle: string,
    // ? MultiSelectSearchCheckCustom
    emptyMessage: string,
    getRowAttr: (data: T) => string,
    loadOptions: (query: string | number) => Promise<T[]>
}

const SelectObjectsModal = <T,>({
    onClose,
    onClick,
    labelOnClick,
    headerTitle,
    emptyMessage,
    getRowAttr,
    loadOptions
}: SelectObjectsModalProps<T>) => {

    const [selectedObject, setSelectedObject] =
        useState<T[]>([]);

    const handlerOnClickButton = () => {
        onClick(selectedObject);
    }

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
                        rowId={getRowAttr}
                        loadOptions={loadOptions}
                        selected={selectedObject}
                        setSelected={setSelectedObject}
                        colorMain="var(--color-theme-primary)"
                        initialOpen={true}
                        emptyMessage={<span className={`nunito-regular ${styleModule.emptyMessage}`}>{emptyMessage}</span>}
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
