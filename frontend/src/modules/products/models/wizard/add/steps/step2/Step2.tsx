import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import SingleImageLoaderCustom from "../../../../../../../comp/primitives/image-loader/single/custom/SingleImageLoaderCustom";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import type { ItemAction, ItemState } from "../../../../../context/itemTypes";
import { back_step } from "../../../../../context/itemActions";
import { useCallback, useState, type Dispatch } from "react";
import StyleModule from "./Step2.module.css"
import { Bookmark } from "lucide-react";
import type { IPartialProduct } from "interfaces/product";
import type { IPartialInput } from "interfaces/inputs";

interface Step2Props {
    state: ItemState,
    dispatch: Dispatch<ItemAction>,
    onCancel: () => void
}

const Step2 = ({ state, dispatch, onCancel }: Step2Props) => {

    const computeCostValue = useCallback((): number | null => {
        let value: number | null;
        if (state.data.item_type === "product") {
            const itemState = state.data.item as IPartialProduct;
            value = itemState.sale_price ?? null;
        } else {
            const itemState = state.data.item as IPartialInput;
            value = itemState.unit_cost ?? null
        }
        return value;
    }, [state.data]);

    const computeProductionCost = useCallback((): number | null => {
        let value: number | null;
        if (state.data.item_type === "product") {
            const itemState = state.data.item as IPartialProduct;
            value = itemState.production_cost ?? null;
        } else {
            value = null;
        }
        return value;
    }, [state.data]);

    const [photo, setPhoto] = useState<File | null>(null);
    const [cost, setCost] = useState<number | null>(computeCostValue());
    const [presentation, setPresentation] = useState<string | null>(state.data.item?.presentation ?? null)
    const [productionCost, setProductionCost] = useState<number | null>(computeProductionCost());

    const handleOnClickNextStep = useCallback(() => {

    }, [dispatch]);

    const handleOnClickBackStep = useCallback(() => {
        dispatch(back_step());
    }, [dispatch]);

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <div className={StyleModule.firstBlock}>
                    <div className={StyleModule.imageContainer}>
                        <SingleImageLoaderCustom
                            value={photo}
                            onChange={setPhoto}
                        />
                    </div>
                    <div className={StyleModule.infoContainer}>
                        <UnderlineLabelInputNumeric
                            label={
                                state.data.item_type === "product"
                                    ? "Precio de venta"
                                    : "Precio de compra"
                            }
                            value={cost}
                            onChange={setCost}
                        />
                        <UnderlineLabelInputNumeric
                            label="Costo de producción"
                            value={productionCost}
                            onChange={setProductionCost}
                        />
                    </div>
                    <div></div>
                </div>
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
                />
                <CriticalActionButton
                    label="Regresar"
                    onClick={handleOnClickBackStep}
                />
                <TertiaryActionButtonCustom
                    label="Guardar y salir"
                    onClick={() => console.log("guardar y salir")}
                    icon={<Bookmark />}
                />
                <MainActionButtonCustom
                    label="Guardar y continuar"
                    onClick={handleOnClickNextStep}
                    icon={<Bookmark />}
                />
            </div>
        </div>
    )
}

export default Step2;