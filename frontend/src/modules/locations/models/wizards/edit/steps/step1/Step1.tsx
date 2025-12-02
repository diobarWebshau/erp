import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import UnderlineLabelInputText from "./../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import UnderlineLabelInputPhone from "../../../../../../../comp/primitives/input/layouts/underline-label/phone/UnderlineLabelInputPhone";
import UnderlineStandardSelectCustom from "./../../../../../../../comp/features/select/underline/UnderlineStandardSelectCustom"
import { useCountryStateCitySeparated } from "../../../../../../../hooks/useCountryStateCity";
import type { LocationState, LocationAction } from "../../../../context/locationTypes";
import { next_step, update_draft_location, add_draft_location_location_type, remove_draft_location_location_type } from "../../../../context/locationActions";
import { useCallback, useState, type Dispatch } from "react";
import { Bookmark } from "lucide-react";
import StyleModule from "./Step1.module.css";
import useLocationTypes from "../../../../../../../modelos/location_types/hooks/useLocationTypes";
import UnderlineObjectSelectMultiCustomMemo from "../../../../../../../comp/features/select/underline/UnderlineObjectSelectMultiCustom";
import type { ILocationType } from "interfaces/locationTypes";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { IPartialLocation } from "../../../../../../../interfaces/locations";
import type { IPartialLocationLocationType } from "../../../../../../../interfaces/locationLocationType";

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

    const [name, setName] = useState<string | null>(state.draft?.name ?? null);
    const [customId, setCustomId] = useState<string | null>(state.draft?.custom_id ?? null);
    const [locationManager, setLocationManager] = useState<string | null>(state.draft?.location_manager ?? null);
    const [countryName, setCountryName] = useState<string | null>(state.draft?.country ?? "Mexico");
    const [stateName, setStateName] = useState<string | null>(state.draft?.state ?? "Baja California");
    const [cityName, setCityName] = useState<string | null>(state.draft?.city ?? "Mexicali");
    const [zipCode, setZipCode] = useState<number | null>(state.draft?.zip_code ?? null);
    const [phone, setPhone] = useState<string | null>(state.draft?.phone ?? null);
    const [neighborhood, setNeighborhood] = useState<string | null>(state.draft?.neighborhood ?? null);
    const [street, setStreet] = useState<string | null>(state.draft?.street ?? null);
    const [streetNumber, setStreetNumber] = useState<number | null>(state.draft?.street_number ?? null);
    const [locationType, setLocationType] = useState<ILocationType[]>(((state.draft?.location_location_type?.length ?? 0) > 0) ? state.draft?.location_location_type?.map((item) => item?.location_type) as ILocationType[] : []);

    // *************** Hooks *************** */

    const csc = useCountryStateCitySeparated({
        countryName, onCountryNameChange: setCountryName,
        stateName, onStateNameChange: setStateName,
        cityName, onCityNameChange: setCityName,
        allowedCountries: ["Mexico", "US", "Canada"],
        countryOrderIso: ["MX", "US", "CA"],
    });

    // *************** Functions *************** */

    const handleOnClickNext = useCallback(() => {
        if (
            !name || name === "" ||
            !customId || customId === "" ||
            !locationManager || locationManager === "" ||
            !countryName || countryName === "" ||
            !stateName || stateName === "" ||
            !cityName || cityName === "" ||
            !zipCode || zipCode === 0 ||
            !phone || phone === "" ||
            !neighborhood || neighborhood === "" ||
            !street || street === "" ||
            !streetNumber || streetNumber === 0
        ) {
            ToastMantine.feedBackForm({
                message: "Debes completar todos los campos",
            });
            return;
        }
        if (locationType.length === 0) {
            ToastMantine.feedBackForm({
                message: "Debes seleccionar al menos un tipo de ubicación",
            });
            return;
        }
        const currentLocationTypes: IPartialLocationLocationType[] =
            state.draft?.location_location_type ?? [];

        const currentIds = new Set(currentLocationTypes.map((i) => i.location_type_id));
        const selectedIds = new Set(locationType.map((lt) => lt.id as number));

        // ➕ Agregar los que están seleccionados y no estaban antes
        locationType.forEach((lt) => {
            if (!currentIds.has(lt.id as number)) {
                const newItem: IPartialLocationLocationType = {
                    location_type_id: lt.id,
                    location_type: lt,
                };
                dispatch(add_draft_location_location_type(newItem));
            }
        });

        // ➖ Quitar los que estaban antes y ya no están seleccionados
        currentLocationTypes.forEach((item) => {
            if (!selectedIds.has(item.location_type_id as number)) {
                dispatch(remove_draft_location_location_type([item.location_type_id as number]));
            }
        });


        const updateLocation: IPartialLocation = {
            name,
            custom_id: customId,
            location_manager: locationManager,
            country: countryName,
            state: stateName,
            city: cityName,
            zip_code: zipCode,
            phone,
            neighborhood,
            street,
            street_number: streetNumber,
        }
        dispatch(update_draft_location(updateLocation));
        dispatch(next_step());
    }, [
        dispatch, locationType, name, customId, locationManager,
        countryName, stateName, cityName, zipCode, phone, neighborhood,
        street, streetNumber, state.draft.location_location_type
    ]);

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
