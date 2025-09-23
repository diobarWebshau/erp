
import { Delete, Minus, Plus } from "lucide-react";
import StyleModule from "./NumericKeyPad.module.css"
import FadeButton from "../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import { useEffect, useState } from "react";
import type { IAllStage, IProductionBreakdown } from "../../../../../../../interfaces/productionOrder";

interface INumericKeypad {
    onClose: () => void;
    title: string;
    breakdown: IProductionBreakdown | null;
    processId: number | null;
    onSave: (qty: number) => void;
}

const keys: string[] = [
    "1", "2", "3", "4",
    "5", "6", "7", "8",
    "9", ".", "0"
]

const NumericKeypad = ({
    onClose,
    title,
    breakdown,
    processId,
    onSave
}: INumericKeypad) => {

    const [value, setValue] = useState<string>("");
    const [validateNumber, setValidateNumber] = useState<boolean>(true);

    const concatValue = (key: string) => {
        setValue((prevValue) => prevValue + key);
        validateQty();
    }

    const deleteValue = () => {
        setValue((prevValue) => prevValue.slice(0, -1));
        validateQty();
    }

    const incrementarValue = () => {
        const newValue = Number(value) + 1;
        const rounded = Number(newValue.toFixed(2));
        setValue(rounded.toString());
        validateQty();
    }

    const decrementarValue = () => {
        // Ej 2.8, lo convierte a  2.7992259592516156165121515
        const newValue = Number(value) - 1;
        /*
            porque existe algunos casos, que el numero en decimal no se puede representar
            correctamente en binario(y lo convierte en decimal mas cercano posible a la 
            cantidad), y por eso se redondea
        */
        const rounded = Number(newValue.toFixed(2));
        setValue(rounded.toString());
    };

    const validateQty = () => {
        const qty = Number(value);
        const stage = breakdown?.all_stages.find(
            (stage: IAllStage) => stage.process_id === processId
        );
        const referenceQty = Number(breakdown?.order_qty) - Number(stage?.done_at_stage);
        if (title.toLowerCase() === "agregar checkpoint") {
            if (qty > 0 && qty <= referenceQty) {

                if (!validateNumber) {
                    setValidateNumber(true);
                }
                return true;
            } else {
                setValidateNumber(false);
                return false;
            }
        } else {
            if (qty > 0) {
                if (!validateNumber) {
                    setValidateNumber(true);
                }
                return true;
            } else {
                setValidateNumber(false);
                return false;
            }
        }

    }

    const handleOnClickSave = () => {
        if (validateQty()) {
            onSave(Number(value));
        }
    }

    useEffect(() => {
        validateQty();
    }, [value]);


    useEffect(() => {
        if (title.toLowerCase() === "agregar checkpoint") {
            const stage = breakdown?.all_stages.find(
                (stage: IAllStage) => stage.process_id === processId
            );
            const referenceQty = Number(breakdown?.order_qty) - Number(stage?.done_at_stage);
            setValue(referenceQty.toString());
        }
    }, []);

    return (
        <section className={StyleModule.containerNumericKeyPad}>
            <h1 className={`nunito-semibold ${StyleModule.headerSection}`}>
                {title}
            </h1>
            <div className={StyleModule.panelSection}>
                <button
                    type="button"
                    onClick={decrementarValue}
                >
                    <Minus className={StyleModule.iconButtonPanel} />
                </button>
                <div className={StyleModule.panel}
                    style={{
                        backgroundColor:
                            title.toLowerCase() === "agregar checkpoint"
                                ? "var(--color-partial-light)"
                                : "var(--color-alert-light)",
                        ...(!validateNumber && {
                            color: "var(--color-alert)",
                        })
                    }}
                >
                    {value}
                </div>
                <button
                    type="button"
                    onClick={incrementarValue}
                >
                    <Plus className={StyleModule.iconButtonPanel} />
                </button>
            </div>
            <div className={StyleModule.controlSection}>
                <div className={StyleModule.controls}>
                    {keys.map((key, index) => (
                        <button
                            className={`nunito-bold ${StyleModule.keyButton}`}
                            key={index}
                            type="button"
                            onClick={() => concatValue(key)}
                        >
                            {key}
                        </button>
                    ))}
                    <button
                        className={`nunito-bold ${StyleModule.keyButton}`}
                        type="button"
                        onClick={deleteValue}
                    >
                        <Delete className={StyleModule.deleteControlIcon} />
                    </button>
                </div>
            </div>
            <div className={StyleModule.actionSection}>
                <FadeButton
                    type="button"
                    label="Cancelar"
                    onClick={onClose}
                    classNameButton={StyleModule.cancelButtonSection}
                    classNameSpan={StyleModule.spanButtonSection}
                    classNameLabel={`nunito-bold ${StyleModule.cancelLabelButtonSection}`}
                />
                <FadeButton
                    type="button"
                    label="Guardar"
                    classNameButton={StyleModule.saveButtonSection}
                    classNameSpan={StyleModule.spanButtonSection}
                    classNameLabel={`nunito-bold ${StyleModule.saveLabelButtonSection}`}
                    onClick={handleOnClickSave}
                />
            </div>
        </section>
    )
}


export default NumericKeypad
