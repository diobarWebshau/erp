import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./TransferModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";

interface TransferModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
}
const TransferModal = ({ onClose, inventory }: TransferModalProps) => {
    return (
        <HeaderModal
            onClose={onClose}
            title="Mover inventario"
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

export default TransferModal;