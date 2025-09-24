// import { useEffect, useState, type ChangeEvent } from "react";
// import styleModule from "./InputToggle.module.css";

// interface InputToggleProps {
//     value: number | undefined;
//     onChange: (value: number) => void;
//     min?: number;
//     className?: string;
//     classNameInput?: string;
// }

// const InputToggle = ({ value, onChange, min = 1, className, classNameInput }: InputToggleProps) => {
//     const [inputValue, setInputValue] = useState(value?.toString() ?? "");

//     // Sync externo
//     useEffect(() => {
//         if (value?.toString() !== inputValue) {
//             setInputValue(value?.toString() ?? "");
//         }
//     }, [value]);

//     // Manejador de cambios en el input
//     const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//         const val = e.target.value;
//         setInputValue(val);

//         const num = Number(val);

//         // Solo actualizamos si es válido
//         // Validamos que el valor sea un número, que no esté vacío y que sea mayor o igual al valor mínimo
//         if (!Number.isNaN(num) && val !== "" && num >= min) {
//             onChange(num);
//         }
//     };

//     const handleBlur = () => {
//         const num = Number(inputValue);

//         // Si el valor es inválido, lo forzamos al mínimo
//         if (Number.isNaN(num) || inputValue === "" || num < min) {
//             onChange(min);
//             setInputValue(min.toString());
//         }
//     };

//     const isValid = () => {
//         const num = Number(inputValue);
//         return !Number.isNaN(num) && inputValue !== "" && num >= min;
//     };

//     return (
//         <div className={`${styleModule.container} ${className}`}>
//             <input
//                 className={`${styleModule.input} ${!isValid() && styleModule.inputValidation} ${classNameInput}`}
//                 type="number"
//                 value={inputValue}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 inputMode="numeric"
//                 pattern="[0-9]*"
//                 min={min}
//             />
//         </div>
//     );
// };

// export default InputToggle;


import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import styleModule from "./NumericInput.module.css";

interface NumericInputProps {
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
    className?: string;
    classNameInput?: string;
    /**
     * Si true: Solo llama onChange al perder foco o Enter.
     * Si false: Llama onChange en cada tecleo.
     * Default: false.
     */
    onlyCommitOnBlur?: boolean;
}

const NumericInput = ({
    value,
    onChange,
    min = 1,
    className,
    classNameInput,
    onlyCommitOnBlur = false,
}: NumericInputProps) => {
    const [inputValue, setInputValue] = useState(value?.toString() ?? "");
    const [isValid, setIsValid] = useState<boolean>(true);

    // ✔️ función pura que NO setea estado
    const computeIsValid = (val: string) => {
        const num = Number(val);
        if (val === "" || Number.isNaN(num)) return false;
        if (num < min) return false;
        return true;
    };

    // Sincroniza cuando cambia value externo
    useEffect(() => {
        const synced = value?.toString() ?? "";
        setInputValue(synced);
        setIsValid(computeIsValid(synced));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, min]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        const ok = computeIsValid(val);
        setIsValid(ok);

        if (!onlyCommitOnBlur && ok) {
            onChange(Number(val));
        }
    };

    const commitChange = () => {
        const ok = computeIsValid(inputValue);
        setIsValid(ok);
        if (ok) {
            onChange(Number(inputValue));
        } else {
            onChange(min);
            const fallback = String(min);
            setInputValue(fallback);
            setIsValid(true);
        }
    };

    const handleBlur = () => {
        if (onlyCommitOnBlur) commitChange();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (onlyCommitOnBlur && e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className={[styleModule.container, className].filter(Boolean).join(" ")}>
            <input
                className={[
                    styleModule.input,
                    classNameInput,
                    !isValid ? styleModule.inputValidation : "",
                ].filter(Boolean).join(" ")}
                type="number"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                inputMode="numeric"
                pattern="[0-9]*"
                min={min}
            />
        </div>
    );
};

export default NumericInput;

