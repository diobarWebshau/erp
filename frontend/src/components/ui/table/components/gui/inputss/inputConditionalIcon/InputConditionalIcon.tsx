import {
    useEffect, useState,
    type ChangeEvent
} from "react";
import styleModule
    from "./InputConditionalIcon.module.css";
import {
    DollarSign
} from "lucide-react";

interface IProps {
    className?: string;
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
    isConditional: boolean | null;
    iconConditional: React.ReactNode;
    iconDefault: React.ReactNode;
    onClickIconDefault?: () => void,
    onClickIconConditional?: () => void;
}

const InputConditionalIcon = ({
    className,
    value,
    onChange,
    min = 1,
    isConditional,
    iconConditional,
    iconDefault,
    onClickIconDefault,
    onClickIconConditional
}: IProps) => {

    const [inputValue, setInputValue] =
        useState<string | undefined>(value?.toString() ?? "");


    // Sync externo
    useEffect(() => {
        if (value?.toString() !== inputValue) {
            setInputValue(value?.toString() ?? "");
        }
    }, [value]);

    // Manejador de cambios en el input
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        const num = Number(val);

        // Solo actualizamos si es válido
        // Validamos que el valor sea un número, que no esté vacío y que sea mayor o igual al valor mínimo
        if (!Number.isNaN(num) && val !== "" && num >= min) {
            onChange(num);
        }
    };

    const handleBlur = () => {

        const num = Number(inputValue);

        // Si el valor es inválido, lo forzamos al mínimo
        if (Number.isNaN(num) || inputValue === "" || num < min) {
            onChange(min);
            setInputValue(min.toString());
        }
    };

    return (
        <div className={styleModule.container}>
            <DollarSign className={styleModule.dollarSign} />
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="numeric"
                // pattern="[0-9]*"
                min={min}
                className={styleModule.input}
                // readOnly={!isConditional}
            />
            {
                isConditional !== null && (
                    <button
                        className={styleModule.button}
                        type="button"
                        onClick={
                            isConditional ?
                                onClickIconConditional :
                                onClickIconDefault
                        }
                    >
                        {
                            isConditional ? (
                                iconConditional
                            ) : (
                                iconDefault
                            )
                        }
                    </button>
                )
            }
        </div>
    )
}

export default InputConditionalIcon;
