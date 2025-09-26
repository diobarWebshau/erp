import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./AddModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import { useState } from "react";
import NumericInputCustom from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Plus } from "lucide-react";
import type { IPartialInventoryMovement } from "../../../../../../../../interfaces/inventoyMovements";
import Separator from "../../../../../../../../comp/primitives/separator/Separator";
import { on } from "events";

interface AddModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
    onAdd: (inventory: IPartialInventoryMovement) => void;
}
const AddModal = ({ onClose, inventory, onAdd }: AddModalProps) => {

    const [qty, setQty] = useState<number>(1);

    const handleOnChangeQty = (value: number) => {
        setQty(value);
    }

    const handleOnClickButtonAdd = () => {
        if (qty <= 0) return;
        const newMovements: IPartialInventoryMovement = {
            item_name: inventory.item_name,
            item_id: inventory.item_id,
            item_type: inventory.item_type,
            
            location_name: inventory.location_name,
            location_id: inventory.location_id,
            
            qty: qty,
            movement_type: "in",
            reference_type: "Purchased",
            reference_id: null,
            production_id: null,
            description: null,
            is_locked: 0,
        }
        onAdd(newMovements);
    }

    return (
        <HeaderModal
            onClose={onClose}
            title="Agregar inventario"
            className={stylesModule.containerHeaderModal}
            classNameCustomContainer={stylesModule.customContainerHeaderModal}
        >
            <h2>{`${inventory.item_id} ${inventory.item_name}`}</h2>

            <Separator />

        

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

            <Separator />

            <div className={stylesModule.containerInputField}>
                <label>Cantidad:</label>
                <NumericInputCustom
                    value={qty}
                    onChange={handleOnChangeQty}
                    classNameContainer={stylesModule.containerInput}
                    classNameInput={stylesModule.input}
                />
            </div>
                        
            <MainActionButtonCustom
                label="Agregar"
                onClick={handleOnClickButtonAdd}
                icon={<Plus />}
                classNameButton={stylesModule.mainActionButton}
            />
            <CriticalActionButton
                label="Cancelar"
                onClick={onClose}
                classNameButton={stylesModule.criticalActionButton}
            />
        </HeaderModal>
    );
};

export default AddModal;