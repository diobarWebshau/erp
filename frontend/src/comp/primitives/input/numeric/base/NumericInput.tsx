import { memo, useCallback, useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import styleModule from "./NumericInput.module.css";

interface NumericInputProps {
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
    classNameInput?: string;
    onlyCommitOnBlur?: boolean;
}

/** onlyCommitOnBlur
 * Si true: Solo llama onChange al perder foco o Enter.
 * Si false: Llama onChange en cada tecleo.
 * Default: false.
 */

const NumericInput = memo(({
    value,
    onChange,
    min = 1,
    max = 100000000000,
    className,
    classNameInput,
    onlyCommitOnBlur = false,
}: NumericInputProps) => {

    const [inputValue, setInputValue] = useState(value?.toString() ?? "");
    const [isValid, setIsValid] = useState<boolean>(true);

    // ? Funcion que valida que el valor ingresado sea valido
    const computeIsValid = useCallback((val: string) => {
        const num = Number(val);
        if (val === "" || Number.isNaN(num)) return false;
        if (num < min) return false;
        if (num > max) return false;
        return true;
    }, [min, max]);

    // ? Funcion que maneja el cambio del input
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        const ok = computeIsValid(val);
        setIsValid(ok);

        // ? Si no se debe commitear al perder el foco y el valor es valido, se llama a onChange
        if (!onlyCommitOnBlur && ok) {
            onChange(Number(val));
        }
    }, [computeIsValid, onlyCommitOnBlur, onChange, setInputValue, setIsValid]);

    // ? Funcion que maneja el commit del input
    const commitChange = useCallback(() => {
        const ok = computeIsValid(inputValue);
        setIsValid(ok);

        // ? Si el valor es valido, se llama a onChange
        if (ok) {
            onChange(Number(inputValue));
        } else {
            onChange(min);
            const fallback = String(min);
            setInputValue(fallback);
            setIsValid(true);
        }
    }, [computeIsValid, inputValue, onChange, min]);

    // ? Funcion que maneja el blur del input
    const handleBlur = useCallback(() => {
        if (onlyCommitOnBlur) commitChange();
    }, [onlyCommitOnBlur, commitChange]);

    // ? Funcion que maneja el keydown del input
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        // ? Si se debe commitear al perder el foco y se presiona Enter, se llama a commitChange
        if (onlyCommitOnBlur && e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        }
    }, [onlyCommitOnBlur]);

    // ? useMemo que genera las clases del input y el container
    const [classNamesContainer, classNamesInput] = useMemo(() => {
        const containerClassNames = `${className} ` +
            `${styleModule.container} `;
        const inputClassNames = `${styleModule.input} ` +
            `${isValid ? classNameInput : styleModule.inputValidation} `;
        return [containerClassNames, inputClassNames];
    }, [classNameInput, className, isValid]);

    // ? useEffect que sincroniza el valor del input con el valor del prop value
    useEffect(() => {
        const synced = value?.toString() ?? "";
        setInputValue(synced);
        setIsValid(computeIsValid(synced));
    }, [value, min, max]);

    return (
        <div className={classNamesContainer}>
            <input
                className={classNamesInput}
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
});

export default NumericInput;