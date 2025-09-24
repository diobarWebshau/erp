import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./RemoveModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";

interface RemoveModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
}
const RemoveModal = ({ onClose, inventory }: RemoveModalProps) => {
    return (
        <HeaderModal
            onClose={onClose}
            title="Baja de inventario"
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

export default RemoveModal;