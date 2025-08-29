import { useEffect, useState, type ChangeEvent } from "react";
import styleModule from "./InputToggle.module.css";

interface InputToggleProps {
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
}

const InputToggle = ({ value, onChange, min = 1 }: InputToggleProps) => {
    const [inputValue, setInputValue] = useState(value?.toString() ?? "");

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

    const isValid = () => {
        const num = Number(inputValue);
        return !Number.isNaN(num) && inputValue !== "" && num >= min;
    };

    return (
        <div className={styleModule.container}>
            <input
                className={`${styleModule.input} ${!isValid() && styleModule.inputValidation}`}
                type="number"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="numeric"
                pattern="[0-9]*"
                min={min}
            />
        </div>
    );
};

export default InputToggle;
