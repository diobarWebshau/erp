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
import styleModule from "./InputToggle.module.css";

interface InputToggleProps {
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

const InputToggle = ({
    value,
    onChange,
    min = 1,
    className,
    classNameInput,
    onlyCommitOnBlur = false,
}: InputToggleProps) => {
    const [inputValue, setInputValue] = useState(value?.toString() ?? "");

    useEffect(() => {
        if (value?.toString() !== inputValue) {
            setInputValue(value?.toString() ?? "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

        if (!onlyCommitOnBlur) {
            // Si se quiere onChange inmediato, notifica al padre
            const num = Number(e.target.value);
            if (!Number.isNaN(num) && e.target.value !== "" && num >= min) {
                onChange(num);
            }
        }
    };

    const commitChange = () => {
        const num = Number(inputValue);
        if (!Number.isNaN(num) && inputValue !== "" && num >= min) {
            onChange(num);
        } else {
            onChange(min);
            setInputValue(min.toString());
        }
    };

    const handleBlur = () => {
        if (onlyCommitOnBlur) commitChange();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (onlyCommitOnBlur && e.key === "Enter") {
            (e.target as HTMLInputElement).blur(); // Forzar blur, que ya comitea
        }
    };

    const isValid = () => {
        const num = Number(inputValue);
        return !Number.isNaN(num) && inputValue !== "" && num >= min;
    };

    return (
        <div className={`${styleModule.container} ${className}`}>
            <input
                className={`${styleModule.input} ${!isValid() && styleModule.inputValidation} ${classNameInput}`}
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

export default InputToggle;
