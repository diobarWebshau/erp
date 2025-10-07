import CriticalActionButton from "../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import DialogModal from "../../primitives/modal2/dialog-modal/base/DialogModal";
import MultiSelectSearchCheckCustom from "../../primitives/select/multi-select/custom/MultiSelectSearchCheckCustom";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { StrictStringKeys } from "../../../interfaces/globalTypes";
import styleModule from "./SelectProductsModal.module.css"

interface SelectObjectsModalProps<T> {
    onClose: () => void,
    onClick: (objects: T[]) => void,
    labelOnClick: string,
    headerTitle: string,

    // ? MultiSelectSearchCheckCustom
    emptyMessage: string,
    attribute: StrictStringKeys<T>,
    loadOptions: (query: string) => Promise<T[]>
}

const SelectObjectsModal = <T,>({
    onClose,
    onClick,
    labelOnClick,
    headerTitle,
    emptyMessage,
    attribute,
    loadOptions
}: SelectObjectsModalProps<T>) => {

    const [selectedObject, setSelectedObject] =
        useState<T[]>([]);
    const [searchMulti, setSearchMulti] =
        useState<string>("");
    const [openMulti, setOpenMulti] =
        useState<boolean>(false);

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
                    <MultiSelectSearchCheckCustom<T>
                        emptyMessage={emptyMessage}
                        attribute={attribute}
                        search={searchMulti}
                        open={openMulti}
                        loadOptions={loadOptions}
                        selected={selectedObject}
                        setSelected={setSelectedObject}
                        setSearch={setSearchMulti}
                        setOpen={setOpenMulti}
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
