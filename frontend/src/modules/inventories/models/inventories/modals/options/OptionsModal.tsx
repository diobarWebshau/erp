import { Minus, Plus } from "lucide-react";
import MainActionButtonCustom from "../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import HeaderModal from "../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../interfaces/inventories";
import stylesModule from "./OptionsModal.module.css"
import TransferIcon from "../../../../../../components/icons/TransferIcon";
import CriticalActionButton from "../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";

interface OptionsModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
    toggleTransferModal: () => void;
    toggleRemoveModal: () => void;
    toggleAddModal: () => void;
}
const OptionsModal = ({
    onClose, inventory,
    toggleAddModal, toggleRemoveModal,
    toggleTransferModal,
}: OptionsModalProps) => {
    return (
        <HeaderModal
            onClose={onClose}
            title="Ajuste de inventario"
            className={stylesModule.containerHeaderModal}
            classNameCustomContainer={stylesModule.customContainerHeaderModal}
        >
            <h2>{`${inventory.item_id} ${inventory.item_name}`}</h2>
            <div className={stylesModule.containerButtons}>
                <MainActionButtonCustom
                    label="Agregar"
                    icon={<Plus />}
                    onClick={toggleAddModal}

                />
                <MainActionButtonCustom
                    label="Remover"
                    icon={<Minus />}
                    onClick={toggleRemoveModal}
                />
                <MainActionButtonCustom
                    label="Mover"
                    icon={<TransferIcon />}
                    onClick={toggleTransferModal}
                />
            </div>
            <CriticalActionButton
                label="Cancelar"
                onClick={onClose}
                classNameButton={stylesModule.criticalActionButton}
            />
        </HeaderModal>
    );
};

export default OptionsModal;