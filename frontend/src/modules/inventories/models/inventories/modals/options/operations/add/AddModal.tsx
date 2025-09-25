import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./AddModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import { useState } from "react";
import NumericInputCustom from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Plus } from "lucide-react";

interface AddModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
}
const AddModal = ({ onClose, inventory }: AddModalProps) => {

    const [qty, setQty] = useState<number>(1);

    const handleOnChangeQty = (value: number) => {
        setQty(value);
    }

    return (
        <HeaderModal
            onClose={onClose}
            title="Agregar inventario"
            className={stylesModule.containerHeaderModal}
            classNameCustomContainer={stylesModule.customContainerHeaderModal}
        >
            <h2>{`${inventory.item_id} ${inventory.item_name}`}</h2>
            <div className={`nunito-bold ${stylesModule.containerInfo}`}>
                <dl>
                    <dt>Movimiento:</dt>
                    <dd>{inventory.inventory_id}</dd>
                </dl>
                <dl>
                    <dt>Fecha:</dt>
                    <dd>{new Date().toLocaleDateString()}</dd>
                </dl>
                <dl>
                    <dt>Encargado:</dt>
                    <dd>{"Roberto Mireles"}</dd>
                </dl>
                <dl>
                    <dt>Ubicacion de origen:</dt>
                    <dd>{inventory.location_name}</dd>
                </dl>
            </div>

            <div className={stylesModule.containerInputField}>
                <label>Cantidad:</label>
                <NumericInputCustom
                    value={qty}
                    onChange={handleOnChangeQty}
                    classNameContainer={stylesModule.containerInput}
                />
            </div>
            <MainActionButtonCustom
                label="Agregar"
                onClick={onClose}
                icon={<Plus />}
                classNameButton={stylesModule.mainActionButton}
            />
            <CriticalActionButton
                label="Cancelar"
                onClick={onClose}
                className={stylesModule.criticalActionButton}
            />
        </HeaderModal>
    );
};

export default AddModal;