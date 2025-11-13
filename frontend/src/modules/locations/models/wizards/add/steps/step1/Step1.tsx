import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import UnderlineLabelInputText from "./../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import UnderlineLabelInputPhone from "../../../../../../../comp/primitives/input/layouts/underline-label/phone/UnderlineLabelInputPhone";
import UnderlineStandardSelectCustom from "./../../../../../../../comp/features/select/underline/UnderlineStandardSelectCustom"
import { useCountryStateCitySeparated } from "../../../../../../../hooks/useCountryStateCity";
import type { LocationState, LocationAction } from "../../../../context/locationTypes";
import { next_step } from "../../../../context/locationActions";
import { useMemo, useState, type Dispatch } from "react";
import { Bookmark } from "lucide-react";
import StyleModule from "./Step1.module.css";
import useLocationTypes from "../../../../../../../modelos/location_types/hooks/useLocationTypes";
import UnderlineObjectSelectMultiCustomMemo from "../../../../../../../comp/features/select/underline/UnderlineObjectSelectMultiCustom";
import type { ILocationType } from "interfaces/locationTypes";

interface IStep1Props {
    state: LocationState,
    dispatch: Dispatch<LocationAction>,
    onCancel: () => void
}

const Step1 = ({
    state,
    dispatch,
    onCancel
}: IStep1Props) => {

    const { locationTypes } = useLocationTypes();

    // *************** States *************** */

    const [name, setName] = useState<string | null>(state.data?.name ?? null);
    const [customId, setCustomId] = useState<string | null>(state.data?.custom_id ?? null);
    const [locationManager, setLocationManager] = useState<string | null>(state.data?.location_manager ?? null);
    const [countryName, setCountryName] = useState<string | null>(state.data?.country ?? "Mexico");
    const [stateName, setStateName] = useState<string | null>(state.data?.state ?? "Baja California");
    const [cityName, setCityName] = useState<string | null>(state.data?.city ?? "Mexicali");
    const [zipCode, setZipCode] = useState<number | null>(state.data?.zip_code ?? null);
    const [phone, setPhone] = useState<string | null>(state.data?.phone ?? null);
    const [neighborhood, setNeighborhood] = useState<string | null>(state.data?.neighborhood ?? null);
    const [street, setStreet] = useState<string | null>(state.data?.street ?? null);
    const [streetNumber, setStreetNumber] = useState<number | null>(state.data?.street_number ?? null);
    const [locationType, setLocationType] = useState<ILocationType[]>(state.data?.location_location_type?.map((item) => item.location_type) ?? []);


    // *************** Hooks *************** */

    const csc = useCountryStateCitySeparated({
        countryName, onCountryNameChange: setCountryName,
        stateName, onStateNameChange: setStateName,
        cityName, onCityNameChange: setCityName,
        allowedCountries: ["Mexico", "US", "Canada"],
        countryOrderIso: ["MX", "US", "CA"],
    });

    // *************** Functions *************** */

    const handleOnClickNext = useMemo(() => () => dispatch(next_step()), [dispatch]);

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <div className={StyleModule.firstBlock}>
                    <UnderlineLabelInputText
                        value={name}
                        onChange={setName}
                        label="Nombre"
                        withValidation
                    />
                    <UnderlineLabelInputText
                        value={customId}
                        onChange={setCustomId}
                        label="ID único"
                        withValidation
                    />
                </div>
                <div className={StyleModule.secondBlock}>
                    <div>
                        <UnderlineLabelInputText
                            value={street}
                            onChange={setStreet}
                            label="Callé"
                            withValidation
                        />
                        <UnderlineLabelInputNumeric
                            value={streetNumber}
                            onChange={setStreetNumber}
                            label="Número externo"
                            withValidation
                        />
                        <UnderlineLabelInputText
                            value={neighborhood}
                            onChange={setNeighborhood}
                            label="Colonia"
                            withValidation
                        />
                    </div>
                    <div>
                        <UnderlineStandardSelectCustom
                            value={countryName}
                            onChange={setCountryName}
                            label="Pais"
                            options={csc.countryNames}
                            withValidation
                            maxHeight="150px"
                        />
                        <UnderlineStandardSelectCustom
                            value={stateName}
                            onChange={setStateName}
                            label="Estado"
                            options={csc.stateNames}
                            disabled={csc.stateNames.length === 0}
                            withValidation
                            maxHeight="150px"
                        />
                        <UnderlineStandardSelectCustom
                            value={cityName}
                            onChange={setCityName}
                            label="Ciudad"
                            options={csc.cityNames}
                            disabled={csc.cityNames.length === 0}
                            withValidation
                            maxHeight="150px"
                        />
                        <UnderlineLabelInputNumeric
                            value={zipCode}
                            onChange={setZipCode}
                            label="Código postal"
                            withValidation
                        />
                        <UnderlineObjectSelectMultiCustomMemo
                            value={locationType}
                            onChange={setLocationType}
                            label="Tipo de ubicación"
                            options={locationTypes}
                            withValidation
                            maxHeight="150px"
                            labelKey="name"
                        />
                    </div>
                </div>
                <div className={StyleModule.thirdBlock}>
                    <UnderlineLabelInputPhone
                        value={phone}
                        onChange={setPhone}
                        label="Telefono"
                        withValidation
                    />
                    <UnderlineLabelInputText
                        value={locationManager}
                        onChange={setLocationManager}
                        label="Responsable"
                        withValidation
                    />
                </div>
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
                />
                <TertiaryActionButtonCustom
                    label="Guardar y salir"
                    onClick={() => console.log("guardar y salir")}
                    icon={<Bookmark />}
                />
                <MainActionButtonCustom
                    label="Guardar y continuar"
                    onClick={handleOnClickNext}
                    icon={<Bookmark />}
                />
            </div>
        </div>
    );
}

export default Step1;
