import { memo, useCallback, useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import styleModule from "./NumericInput.module.css";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

interface NumericInputProps {
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    classNameContainer?: string;
    classNameInput?: string,
    classNameInputValid?: string;
    classNameInputInvalid?: string;
    placeholder?: string;
    classNameControls?: string;
    classNameControlsIcon?: string;
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
    classNameContainer,
    classNameInput,
    classNameInputValid,
    classNameInputInvalid,
    placeholder,
    onlyCommitOnBlur = false,
    classNameControls,
    classNameControlsIcon
}: NumericInputProps) => {

    const [inputValue, setInputValue] = useState(value?.toString() ?? "");
    const [isValid, setIsValid] = useState<boolean>(true);

    const handleOnClickUp = useCallback(() => {
        const val = Number(inputValue);
        if (val < max) {
            setInputValue(String(val + 1));
            onChange(val + 1);
        }
    }, [inputValue, max, onChange]);

    const handleOnClickDown = useCallback(() => {
        const val = Number(inputValue);
        if (val > min) {
            setInputValue(String(val - 1));
            onChange(val - 1);
        }
    }, [inputValue, min, onChange]);


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
            onChange(max);
            const fallback = String(max);
            setInputValue(fallback);
            setIsValid(true);
        }
    }, [computeIsValid, inputValue, onChange, max]);

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

    // ? function que genera las clases del input y el container
    const [classNamesContainer, classNamesInput] = (() => {
        const containerClassNames = clsx(classNameContainer, styleModule.container);
        const inputClassNames = clsx(
            styleModule.input,
            classNameInput,
            isValid ? classNameInputValid : classNameInputInvalid);
        return [containerClassNames, inputClassNames];
    })();

    // ? useEffect que sincroniza el valor del input con el valor del prop value
    useEffect(() => {
        const synced = value?.toString() ?? "";
        console.log(`synced`, synced);
        setInputValue(synced);
        setIsValid(computeIsValid(synced));
    }, [value, min, max]);


    return (
        <div className={clsx(classNamesContainer)}>
            <input
                {...(placeholder ? { placeholder } : {})}
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
            <div className={clsx(classNameControls, styleModule.controls)}>
                <span onClick={handleOnClickUp}>
                    <ChevronUp className={clsx(styleModule.iconControl, classNameControlsIcon)} />
                </span>
                <span onClick={handleOnClickDown}>
                    <ChevronDown className={clsx(styleModule.iconControl, classNameControlsIcon)} />
                </span>
            </div>
        </div>
    );
});

export default NumericInput;