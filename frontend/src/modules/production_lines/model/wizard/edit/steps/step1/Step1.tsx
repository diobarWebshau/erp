import InputTextCustom from "../../../../../../../comp/primitives/input/text/custom/InputTextCustom";
import ObjectSelectCustomMemo from "../../../../../../../comp/primitives/select/object-select/base/base/ObjectSelectCustom";
import useLocations from "../../../../../../../modelos/locations/hooks/useAllLocations";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import { set_step, update_draft_production_line } from "../../../../../context/productionLineActions";
import type { ILocation } from "interfaces/locations";
import {  ChevronRight, Text } from "lucide-react";
import { memo, type Dispatch } from "react";
import { useState, useCallback } from "react";
import StyleModule from "./Step1.module.css";
import type { ProductionLineAction, ProductionLineState, } from "../../../../../context/productionLineTypes";

interface IStep3 {
    state: ProductionLineState,
    dispatch: Dispatch<ProductionLineAction>
    onCancel: () => void;
}

const Step3 = memo(({
    state,
    dispatch,
    onCancel
}: IStep3) => {

    const [name, setName] = useState<string>(state.draft.name || "");
    const [customId, setCustomId] = useState<string>(state.draft.custom_id || "");

    const handleOnChangeLocation = useCallback((location: ILocation | null) => {
        if (!location) return;
        dispatch(update_draft_production_line({
            location_production_line: {
                location: location,
                location_id: location?.id ?? null
            }
        }));
    }, [dispatch]);

    const { locations } = useLocations({
        like: "",
        conditionsExclude: {
            is_active: false
        }
    });

    const handleOnClickNext = useCallback(() => {
        if (name === "" || customId === "" || state.draft.location_production_line?.location === undefined) {
            ToastMantine.feedBackForm({
                message: "Debe completar todos los campos",
            });
            return;
        }
        dispatch(update_draft_production_line({
            name: name,
            custom_id: customId,
        }));
        dispatch(set_step(1));
    }, [state, name, customId, dispatch, ToastMantine]);

    return <div className={StyleModule.containerStep}>
        <div className={StyleModule.containerContent}>
            <InputTextCustom
                value={name}
                onChange={setName}
                icon={<Text />}
                placeholder="Nombre de la línea"
                withValidation
            />
            <div className={StyleModule.secondBlock}>
                <InputTextCustom
                    value={customId}
                    onChange={setCustomId}
                    icon={<Text />}
                    placeholder="Id único"
                    withValidation
                />
                <ObjectSelectCustomMemo
                    labelKey={'name'}
                    value={state.draft.location_production_line?.location ?? null}
                    onChange={handleOnChangeLocation}
                    options={locations}

                />
            </div>
        </div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={onCancel}
                label="Cancelar"
            />
            <MainActionButtonCustom
                onClick={handleOnClickNext}
                label="Siguiente"
                icon={<ChevronRight />}
            />
        </div>
    </div>
});

export default Step3;