import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import StandardSelectMultiCustomMemo from "../../../../../../../comp/features/select/underline/UnderlineStandardSelectCustom"
import StandarTextAreaCustom from "../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom"
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { IPartialProduct } from "../../../../../../../interfaces/product";
import type { ItemAction, ItemState } from "../../../../../context/itemTypes";
import { update_item } from "../../../../../context/itemActions";
import type { IPartialInput } from "../../../../../../../interfaces/inputs";
import { next_step } from "../../../../../context/itemActions";
import type { ChangeEvent, Dispatch } from "react";
import { useCallback, useState } from "react";
import { Bookmark } from "lucide-react";
import StyleModule from "./Step1.module.css"
import type { IPartialItem } from "interfaces/item";

interface Step1Prop {
    state: ItemState,
    dispatch: Dispatch<ItemAction>,
    onCancel: () => void
}

const options = ["Producto terminado", "Materia prima"];

const Step1 = ({ state, dispatch, onCancel }: Step1Prop) => {


    const [name, setName] = useState<string | null>(state.data.item?.name ?? null);
    const [customId, setCustomId] = useState<string | null>(state.data.item?.custom_id ?? null);
    const [itemType, setItemType] = useState<string | null>(
        state.data?.item_type
            ? (state.data?.item_type === "product" ? "Producto terminado" : "Materia prima")
            : null
    );
    const [barcode, setBarcode] = useState<number | null>(state.data.item?.barcode ?? null);
    const [description, setDescription] = useState<string | null>(state.data.item?.description ?? null);

    const handleOnChangeDescription = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setDescription(value);
    }, []);

    const handleOnClickNextStep = useCallback(() => {
        if (
            !name || name == "" ||
            !customId || customId == "" ||
            !itemType || itemType == "" ||
            !barcode || barcode === 0
        ) {
            ToastMantine.feedBackForm({
                message: "Debes completar todos los campos"
            });
            return;
        }
        const castItemType = itemType === "Producto terminado" ? "product" : "input";
        let item: IPartialProduct | IPartialInput = {
            name: name ?? undefined,
            custom_id: customId ?? undefined,
            barcode: barcode ?? undefined,
            description: description ?? undefined
        };
        const itemObject: IPartialItem = {
            item: item,
            item_type: castItemType
        };
        dispatch(update_item(itemObject));
        dispatch(next_step());
    }, [dispatch, name, customId, barcode, itemType, description]);

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <UnderlineLabelInputText
                    label="Nombre"
                    value={name}
                    onChange={setName}
                    withValidation
                />
                <div className={StyleModule.firstBlock}>
                    <UnderlineLabelInputText
                        label="Id único"
                        value={customId}
                        onChange={setCustomId}
                        withValidation
                    />
                    <StandardSelectMultiCustomMemo
                        options={options}
                        label="Categoria"
                        value={itemType}
                        onChange={setItemType}
                        withValidation
                        maxHeight="150px"
                    />
                    <UnderlineLabelInputNumeric
                        label="Codigo de barras"
                        value={barcode}
                        onChange={setBarcode}
                        withValidation
                        min={0}
                    />
                </div>
                <StandarTextAreaCustom
                    value={description ?? ""}
                    onChange={handleOnChangeDescription}
                    placeholder="Descripción"
                    classNameContainer={StyleModule.containerTextArea}
                    classNameTextArea={StyleModule.textArea}
                    maxLength={1000}
                />
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
                    onClick={handleOnClickNextStep}
                    icon={<Bookmark />}
                />
            </div>
        </div>
    )
};

export default Step1;