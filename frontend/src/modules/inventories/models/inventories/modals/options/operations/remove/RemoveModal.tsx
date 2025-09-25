import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./RemoveModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import { useState } from "react";
import NumericInputCustom from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Minus, Plus } from "lucide-react";
import StandarSelectCustom from "../../../../../../../../comp/primitives/select/standar-select/custom/StandarSelectCustom";
import StandarTextAreaCustom from "../../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";

interface RemoveModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
}

const options = [
    "Caducado",
    "Extraviado",
    "Dañado",
    "Robado",
]

const RemoveModal = ({ onClose, inventory }: RemoveModalProps) => {

    const [qty, setQty] = useState<number>(1);
    const [reason, setReason] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    const handleOnChangeQty = (value: number) => {
        setQty(value);
    }

    const handleOnChangeReason = (value: string) => {
        setReason(value);
    }

    const handleOnChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    }

    return (
        <HeaderModal
            onClose={onClose}
            title="Baja de inventario"
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

            <StandarSelectCustom
                options={options}
                defaultLabel="Selecciona un motivo"
                autoOpen={false}
                onChange={handleOnChangeReason}
                value={reason}
                classNameFieldContainer={stylesModule.containerFieldSelect}
                classNameOption={stylesModule.containerOptionSelect}
            />
            

            <StandarTextAreaCustom
                value={notes}
                onChange={handleOnChangeNotes}
                classNameContainer={stylesModule.containerTextArea}
                classNameTextArea={`nunito-regular ${stylesModule.textArea}`}
            />

            <MainActionButtonCustom
                label="Remover"
                onClick={onClose}
                icon={<Minus />}
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

export default RemoveModal;