import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, JSX, KeyboardEvent, ReactNode } from "react";
import withClassName from "../../../../../../../utils/withClassName";
import styleModule from "./DobleIconInputNumeric.module.css";
import clsx from "clsx";

interface DobleIconInputNumericProps {
    value: number | null;
    onChange: (value: number | null) => void;
    min?: number;
    max?: number;
    onlyCommitOnBlur?: boolean;
    firstIcon?: ReactNode,
    lastIcon?: ReactNode,
    disabled?: boolean;
    withValidation?: boolean;
}

const DobleIconInputNumeric = memo(({
    value,
    onChange,
    min = 0,
    max = 1000000000000000000000000000000000000,
    onlyCommitOnBlur = false,
    disabled = false,
    withValidation = false,
    firstIcon,
    lastIcon,
}: DobleIconInputNumericProps) => {

    const refInput = useRef<HTMLInputElement>(null);

    const [inputValue, setInputValue] = useState<string>(value ? value.toString() : "");
    const [isValid, setIsValid] = useState<boolean>(true);

    const computeIsValid = useCallback((val: string) => {
        const num = Number(val);
        if (val === "" || Number.isNaN(num)) return false;
        if (!(num > 0)) return false;
        if (num < min) return false;
        if (num > max) return false;
        return true;
    }, [min, max]);

    const errorActive = useMemo(() => isValid === false, [isValid]);

    // ----------------------------------------
    // HANDLERS
    // ----------------------------------------

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        const ok = computeIsValid(val);
        setIsValid(ok);

        if (!onlyCommitOnBlur && ok) {
            onChange(Number(val));
        } else {
            onChange(null);
        }
    }, [computeIsValid, onlyCommitOnBlur, onChange]);

    const commitChange = useCallback(() => {
        const ok = computeIsValid(inputValue);
        setIsValid(ok);

        if (ok) {
            onChange(Number(inputValue));
        } else {
            const fallback = String(max);
            setInputValue(fallback);
            setIsValid(true);
            onChange(max);
        }
    }, [computeIsValid, inputValue, onChange, max]);

    const handleBlur = useCallback(() => {
        if (onlyCommitOnBlur) {
            commitChange();
        }
    }, [onlyCommitOnBlur, commitChange]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (onlyCommitOnBlur && e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        }
    }, [onlyCommitOnBlur]);

    // ----------------------------------------
    // CLASES (sin label flotante ni iconos)
    // ----------------------------------------

    const [classNamesFisrtIcon, classNamesLastIcon, classNamesInput, classNamesContainer] = useMemo(() => {

        const firstIconClassNames = withClassName(firstIcon as JSX.Element, clsx(
            styleModule.iconFirst,
            (withValidation && errorActive) && styleModule.iconFirstError
        ));

        const lastIconClassNames = withClassName(firstIcon as JSX.Element, clsx(
            styleModule.iconLast,
            (withValidation && errorActive) && styleModule.iconLastError
        ));

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

        return [firstIconClassNames, lastIconClassNames, inputClassNames, containerClassNames];
    }, [errorActive, withValidation, disabled, firstIcon, lastIcon]);

    // ----------------------------------------
    // EFFECT SYNC
    // ----------------------------------------

    useEffect(() => {
        const synced = value?.toString() ?? "";
        setInputValue(synced);
        setIsValid(computeIsValid(synced));
    }, [value, computeIsValid]);

    // ----------------------------------------
    // RENDER
    // ----------------------------------------

    return (
        <div className={clsx(classNamesContainer)}>
            {firstIcon ? classNamesFisrtIcon : null}
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
                disabled={disabled}
            />
            {lastIcon ? classNamesLastIcon : null}
        </div>
    );
});

export default DobleIconInputNumeric;
