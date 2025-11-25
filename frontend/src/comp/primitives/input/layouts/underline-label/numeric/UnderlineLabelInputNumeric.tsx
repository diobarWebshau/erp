import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import styleModule from "./UnderlineLabelInputNumeric.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

interface NumericInputProps {
    value: number | null;
    onChange: (value: number | null) => void;
    min?: number;
    max?: number;
    onlyCommitOnBlur?: boolean;
    label?: string;
    disabled?: boolean;
    withValidation?: boolean;
}

/** onlyCommitOnBlur
 * Si true: Solo llama onChange al perder foco o Enter.
 * Si false: Llama onChange en cada tecleo.
 * Default: false.
 */

const UnderlineLabelInputNumeric = memo(({
    value,
    onChange,
    min = 0,
    max = 1000000000000000000000000000000000000,
    onlyCommitOnBlur = false,
    label,
    disabled = false,
    withValidation = false
}: NumericInputProps) => {

    // *************** Referencias ***************

    const refInput = useRef<HTMLInputElement>(null);

    // *************** Manejo del estado ***************

    const [inputValue, setInputValue] = useState<string>(value ? value?.toString() : "");
    const [isValid, setIsValid] = useState<boolean>(true);
    const [focused, setFocused] = useState<boolean>(false);
    const errorActive = useMemo(() => isValid === false, [isValid]);

    // *************** Funciones ***************

    // ? Funcion que valida que el valor ingresado sea valido
    const computeIsValid = useCallback((val: string) => {
        const num = Number(val);
        if (!(num > 0)) return false;
        if (val === "" || Number.isNaN(num) || val.length === 0) return false;
        if (num < min) return false;
        if (num > max) return false;
        return true;
    }, [min, max]);

    const handleOnClickUp = useCallback(() => {
        if (disabled) return;
        const val = Number(inputValue);
        if (val < max) {
            setIsValid(computeIsValid(String(val)));
            setInputValue(prev => String((isNaN(Number(prev)) ? 0 : Number(prev)) + 1));
            onChange(Number(inputValue) + 1);
        }
    }, [inputValue, max, onChange, computeIsValid, disabled]);

    const handleOnClickDown = useCallback(() => {
        if (disabled) return;
        const val = Number(inputValue);
        if (val > min) {
            setIsValid(computeIsValid(String(val)));
            setInputValue(prev => String((isNaN(Number(prev)) ? 0 : Number(prev)) - 1));
            onChange(Number(inputValue) - 1);
        }
    }, [inputValue, min, onChange, computeIsValid, disabled]);

    // *************** Manejo de eventos ***************

    // ? Funcion que maneja el cambio del input
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        const ok = computeIsValid(val);
        setIsValid(ok);
        // ? Si no se debe commitear al perder el foco y el valor es valido, se llama a onChange
        if (!onlyCommitOnBlur && ok) {
            onChange(Number(val));
        } else {
            onChange(null);
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
            const fallback = String(max);
            setInputValue(fallback);
            setIsValid(true);
            onChange(max);
        }
    }, [computeIsValid, inputValue, onChange, max]);

    // ? Funcion que maneja el blur del input
    const handleBlur = useCallback(() => {
        setFocused(false);
        const ok = computeIsValid(inputValue);
        setIsValid(ok);
        if (onlyCommitOnBlur) commitChange();
    }, [onlyCommitOnBlur, commitChange, computeIsValid, inputValue]);

    // ? Funcion que maneja el keydown del input
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        // ? Si se debe commitear al perder el foco y se presiona Enter, se llama a commitChange
        if (onlyCommitOnBlur && e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        }
    }, [onlyCommitOnBlur]);

    const handleOnFocus = useCallback(() => setFocused(true), []);
    const handleOnMouseDown = useCallback((e: MouseEvent<HTMLSpanElement>) => e.preventDefault(), []);

    // *************** Manejo de estilos ***************

    // ? function que genera las clases del input y el container
    const [classNamesLabel, classNamesInput, classNamesContainer, classNameIconControl] = useMemo(() => {
        const labelClassNames = clsx(
            styleModule.label,
            "nunito-semibold",
            (focused || inputValue.length > 0) && styleModule.labelFloating,
            (withValidation && errorActive) && styleModule.labelError
        );

        const inputClassNames = clsx(
            styleModule.input,
            "nunito-regular",
            (withValidation && errorActive) && styleModule.inputError
        );

        const containerClassNames = clsx(
            styleModule.container,
            (withValidation && errorActive) && styleModule.errorContainer,
            disabled && styleModule.disabledContainer
        );

        const iconControlClassNames = clsx(
            styleModule.iconControl,
            (withValidation && errorActive) && styleModule.iconError
        );

        return [labelClassNames, inputClassNames, containerClassNames, iconControlClassNames];
    }, [focused, inputValue, errorActive, withValidation, disabled]);


    // *************** Manejo de efectos ***************

    // ? useEffect que sincroniza el valor del input con el valor del prop value
    useEffect(() => {
        const synced = value?.toString() ?? "";
        setInputValue(synced);
        setIsValid(computeIsValid(synced));
        if (!refInput.current) return;
    }, [value, refInput, computeIsValid]);

    return (
        <div className={clsx(classNamesContainer)}>
            <label className={classNamesLabel}>{label}</label>
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
                ref={refInput}
                onFocus={handleOnFocus}
                disabled={disabled}
            />
            <div className={styleModule.controls}>
                <span
                    onClick={handleOnClickUp}
                    onMouseDown={handleOnMouseDown}
                    className={disabled ? styleModule.disabledIconControl : ""}
                >
                    <ChevronUp className={classNameIconControl} />
                </span>
                <span
                    onClick={handleOnClickDown}
                    onMouseDown={handleOnMouseDown}
                    className={disabled ? styleModule.disabledIconControl : ""}
                >
                    <ChevronDown className={classNameIconControl} />
                </span>
            </div>
        </div >
    );
});

export default UnderlineLabelInputNumeric;