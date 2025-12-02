import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText"
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import UnderlineObjectSelectCustom from "../../../../../../../comp/features/select/underline/UnderlineObjectSelectCustom"
import type { ProductionLineAction, ProductionLineState, } from "../../../../../context/productionLineTypes";
import { set_step, update_production_line } from "../../../../../context/productionLineActions";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import useLocations from "../../../../../../../modelos/locations/hooks/useAllLocations";
import type { ILocation } from "interfaces/locations";
import { Bookmark } from "lucide-react";
import { useState, useCallback } from "react";
import StyleModule from "./Step1.module.css";
import { memo, type Dispatch } from "react";

interface IStep3 {
    state: ProductionLineState,
    dispatch: Dispatch<ProductionLineAction>
    onCancel: () => void;
}

const Step3 = memo(({ state, dispatch, onCancel }: IStep3) => {

    const { locations } = useLocations({ like: "", conditionsExclude: { is_active: false } });
    const [name, setName] = useState<string | null>(state.data?.name ?? null);
    const [customId, setCustomId] = useState<string | null>(state.data?.custom_id ?? null);

    const handleOnChangeLocation = useCallback((location: ILocation | null | undefined) => {
        if (!location) return;
        dispatch(update_production_line({
            location_production_line: {
                location: location,
                location_id: location?.id ?? null
            }
        }));
    }, [dispatch]);

    const handleOnClickNext = useCallback(() => {
        if (!name || name === "" || !customId || customId === "" || state.data?.location_production_line?.location === undefined) {
            ToastMantine.feedBackForm({ message: "Debe completar todos los campos" });
            return;
        }
        dispatch(update_production_line({ name: name, custom_id: customId }));
        dispatch(set_step(1));
    }, [state.data, name, customId, dispatch]);

    return <div className={StyleModule.containerStep}>
        <div className={StyleModule.containerContent}>
            <UnderlineLabelInputText
                value={name ?? ""}
                onChange={setName}
                label={"Nombre"}
                withValidation
            />
            <div className={StyleModule.secondBlock}>
                <UnderlineLabelInputText
                    value={customId}
                    onChange={setCustomId}
                    label={"Id único"}
                    withValidation
                />
                <UnderlineObjectSelectCustom
                    label="Ubicación"
                    labelKey={'name'}
                    value={state.data.location_production_line?.location ?? null}
                    onChange={handleOnChangeLocation}
                    options={locations}
                    maxHeight="150px"
                    withValidation
                />
            </div>
        </div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={onCancel}
                label="Cancelar"
            />
            <TertiaryActionButtonCustom
                onClick={() => console.log("guardar y salir")}
                label="Guardar y salir"
                icon={<Bookmark />}
            />
            <MainActionButtonCustom
                onClick={handleOnClickNext}
                label="Guardar y continuar"
                icon={<Bookmark />}
            />
        </div>
    </div>
});

export default Step3;