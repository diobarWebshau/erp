import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./AddModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";

interface AddModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
}
const AddModal = ({ onClose, inventory }: AddModalProps) => {
    return (
        <HeaderModal
            onClose={onClose}
            title="Agregar inventario"
            className={stylesModule.containerHeaderModal}
            classNameCustomContainer={stylesModule.customContainerHeaderModal}
        >

            <CriticalActionButton
                label="Cancelar"
                onClick={onClose}
                className={stylesModule.criticalActionButton}
            />
        </HeaderModal>
    );
};

export default AddModal;