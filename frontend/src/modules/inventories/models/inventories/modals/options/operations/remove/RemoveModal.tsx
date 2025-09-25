import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./RemoveModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import { useState } from "react";
import NumericInputCustom from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Minus } from "lucide-react";
import StandarSelectCustom from "../../../../../../../../comp/primitives/select/standar-select/custom/StandarSelectCustom";
import StandarTextAreaCustom from "../../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import type { IPartialScrap } from "../../../../../../../../interfaces/scrap";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../../../store/store";

interface RemoveModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
    onRemove: (scrap: IPartialScrap) => void;
}

const options = [
    "Caducado",
    "Extraviado",
    "Dañado",
    "Robado",
]

const RemoveModal = ({
    onClose,
    inventory,
    onRemove
}: RemoveModalProps) => {

    const user = useSelector((state: RootState)=> state.auth);
    

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

    const handleOnClickButtonRemove = () => {
        const scrap: IPartialScrap = {
            // ITEM
            item_id: inventory.item_id,
            item_name: inventory.item_name,
            item_type: inventory.item_type,
            qty: qty,
            // LOCATION
            location_id: inventory.location_id,
            location_name: inventory.location_name,
            // INFO
            reason: reason,
            reference_id: null,
            reference_type: "Inventory",
            user_name: user.username,
            user_id: user.userId,
        }
        onRemove(scrap);
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
                    classNameInput={stylesModule.input}
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
                onClick={handleOnClickButtonRemove}
                icon={<Minus />}
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

export default RemoveModal;