import DialogModal from "../../../../../comp/primitives/modal2/dialog-modal/base/DialogModal";
import StyleModule from "./AddressModal.module.css";
import StandardSelectCustomMemo from "../../../../../comp/features/select/StandardSelectCustom";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCountryStateCitySeparated } from "../../../../../hooks/useCountryStateCity";
import TertiaryActionButtonCustom from "../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import MainActionButtonCustom from "../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import type { IPartialClientAddress } from "interfaces/clientAddress";
import ToastMantine from "../../../../../comp/external/mantine/toast/base/ToastMantine";
import UnderlineLabelInputText from "../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import UnderlineLabelInputNumeric from "../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";

interface IAddressModal {
    onClose: () => void,
    onAdd: (address: IPartialClientAddress) => void
}

const AddressModal = ({ onClose, onAdd }: IAddressModal) => {

    const [street, setStreet] = useState<string>('');
    const [streetNumber, setStreetNumber] = useState<number | null>(null);
    const [neighborhood, setNeighborhood] = useState<string>('');
    const [countryName, setCountryName] = useState<string>('México');
    const [stateName, setStateName] = useState<string>('Baja California');
    const [cityName, setCityName] = useState<string>('Mexicali');
    const [zipCode, setZipCode] = useState<number | null>(null);

    const csc = useCountryStateCitySeparated({
        countryName, onCountryNameChange: setCountryName,
        stateName, onStateNameChange: setStateName,
        cityName, onCityNameChange: setCityName,
        allowedCountries: ["Mexico", "US", "Canada"],
        countryOrderIso: ["MX", "US", "CA"],
    });

    const handleAddAddress = () => {
        if (
            street === '' || streetNumber === null ||
            neighborhood === '' || countryName === '' ||
            stateName === '' || cityName === '' || zipCode === null) {
            ToastMantine.feedBackForm({
                message: "Debe completar todos los campos",
            });
            return;
        }
        const address: IPartialClientAddress = {
            street_number: streetNumber,
            street: street,
            neighborhood: neighborhood,
            country: countryName,
            state: stateName,
            city: cityName,
            zip_code: zipCode,
        };
        onAdd(address);
    };

    return (
        <DialogModal
            onClose={onClose}
            className={StyleModule.containerModal}
            classNameCustomContainer={StyleModule.customConainerModal}
        >
            <div className={StyleModule.taxAddressContainer}>
                <h2 className="nunito-semibold">Dirección de envío</h2>
                <div className={StyleModule.fieldBlock}>
                    <UnderlineLabelInputText
                        value={street}
                        onChange={setStreet}
                        withValidation
                        label="Calle"
                    />
                    <UnderlineLabelInputNumeric
                        value={streetNumber}
                        onChange={setStreetNumber}
                        label="Numero exterior"
                    />
                    <UnderlineLabelInputText
                        value={neighborhood}
                        onChange={setNeighborhood}
                        label="Colonia"
                        withValidation
                    />
                </div>
                <div className={StyleModule.fieldBlock}>
                    <StandardSelectCustomMemo
                        options={csc.countryNames}
                        value={countryName}
                        onChange={setCountryName}
                        placeholder="Selecciona un pais"
                        withValidation
                        disabled={csc.countryNames.length === 0}
                        maxHeight="200px"
                    />
                    <StandardSelectCustomMemo
                        options={csc.stateNames}
                        value={stateName}
                        onChange={setStateName}
                        placeholder="Selecciona un estado"
                        withValidation
                        disabled={csc.stateNames.length === 0}
                        maxHeight="200px"
                    />
                    <StandardSelectCustomMemo
                        options={csc.cityNames}
                        value={cityName}
                        onChange={setCityName}
                        placeholder="Selecciona una ciudad"
                        withValidation
                        disabled={csc.cityNames.length === 0}
                        maxHeight="200px"
                    />
                    <UnderlineLabelInputNumeric
                        value={zipCode}
                        onChange={setZipCode}
                        label="Codigo postal"
                        withValidation
                    />
                </div>
            </div>
            <div className={StyleModule.containerButtons}>
                <TertiaryActionButtonCustom
                    label="Cancelar"
                    onClick={onClose}
                />
                <MainActionButtonCustom
                    label="Agregar direccion"
                    onClick={handleAddAddress}
                    icon={<Plus />}
                />
            </div>
        </DialogModal>
    );
};

export default AddressModal;
