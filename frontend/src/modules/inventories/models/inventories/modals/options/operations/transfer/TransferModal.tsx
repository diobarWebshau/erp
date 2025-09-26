import HeaderModal from "../../../../../../../../comp/primitives/modal2/header-modal/base/HeaderModal";
import type { IInventoryDetails } from "../../../../../../../../interfaces/inventories";
import stylesModule from "./TransferModal.module.css"
import CriticalActionButton from "../../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import useLocations from "../../../../hooks/useLocations";
import { useState } from "react";
import ObjectSelectCustom from "../../../../../../../../comp/primitives/select/object-select/custom/ObjectSelectCustom";
import type { ILocation } from "../../../../../../../../interfaces/locations";
import StandarTextAreaCustom from "../../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import NumericInputCustom from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TransferIcon from "../../../../../../../../components/icons/TransferIcon";
import Separator from "../../../../../../../../comp/primitives/separator/Separator";
import InputDatePickerCustom from "../../../../../../../../comp/primitives/input/date/custom/InputDatePickerCustom";
import { isValidDate } from "../../../../../../../../utils/fomatted_data_mysql/formtated_date_mysql";
import type { IPartialInventoryTransfer } from "../../../../../../../../interfaces/inventoryTransfer";
interface TransferModalProps {
    onClose: () => void;
    inventory: IInventoryDetails;
    onTransfer: (inventoryTransfer: IPartialInventoryTransfer) => void;
}

const TransferModal = ({
    onClose,
    inventory,
    onTransfer
}: TransferModalProps) => {

    const [location, setLocation] = useState<ILocation | null | undefined>(null);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [notes, setNotes] = useState<string>("");
    const [qty, setQty] = useState<number>(1);

    const {
        locations,
        loadingLocations
    } = useLocations();

    const handleOnChangeLocation = (value: ILocation | null | undefined) => {
        setLocation(value);
    }

    const handleOnChangeDate = (value: Date | undefined) => {
        setDate(value);
    }

    const handleOnChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    }

    const handleOnChangeQty = (value: number) => {
        setQty(value);
    }

    const handleOnClickButtonMove = () => {
        if (!location || (date && !isValidDate(date.toISOString().slice(0, 10))) || qty <= 0) {
            return;
        }
        const sourceLocation = locations.find(location => location.id === inventory.location_id);
        const inventoryTransfer: IPartialInventoryTransfer = {
            qty: qty,
            source_location_id: sourceLocation?.id,
            source_location: sourceLocation,
            destination_location: location,
            destination_location_id: location.id,
            item_id: inventory.item_id,
            item_name: inventory.item_name,
            item_type: inventory.item_type,
            reason: notes,
        }
        onTransfer(inventoryTransfer);
    }

    return (
        <HeaderModal
            onClose={onClose}
            title="Mover inventario"
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

            {
                !loadingLocations &&
                <ObjectSelectCustom
                    options={locations.filter((location) => location.id !== inventory.location_id)}
                    labelKey="name"
                    defaultLabel="Selecciona una ubicacion"
                    autoOpen={false}
                    onChange={handleOnChangeLocation}
                    value={location}
                    classNameFieldContainer={stylesModule.containerFieldObjectSelect}
                    classNameToggleContainer={stylesModule.containerToggleObjectSelect}
                    classNameOption={stylesModule.containerOptionObjectSelect}
                />
            }

            <div className={stylesModule.containerInputField}>
                <label>Cantidad:</label>
                <NumericInputCustom
                    value={qty}
                    onChange={handleOnChangeQty}
                    classNameContainer={stylesModule.containerInput}
                    classNameInput={stylesModule.input}
                />
            </div>

            <InputDatePickerCustom
                value={date}
                onChange={handleOnChangeDate}
                classNameInput={`nunito-semibold ${stylesModule.inputDatePicker}`}
            />

            <StandarTextAreaCustom
                value={notes}
                onChange={handleOnChangeNotes}
                classNameContainer={stylesModule.containerTextArea}
                classNameTextArea={`nunito-regular ${stylesModule.textArea}`}
                placeholder="Motivo del movimiento"
                maxLength={200}
            />

            <Separator />

            <MainActionButtonCustom
                label="Mover"
                onClick={handleOnClickButtonMove}
                classNameButton={stylesModule.mainActionButton}
                icon={<TransferIcon />}
            />

            <CriticalActionButton
                label="Cancelar"
                onClick={onClose}
                classNameButton={stylesModule.criticalActionButton}
            />

        </HeaderModal>
    );
};

export default TransferModal;