import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import withClassName from "../../../../../../utils/withClassName";
import StyleModule from "./UnderlineLabelInputText.module.css";
import type { ChangeEvent, MouseEvent } from "react";
import { Text } from "lucide-react";
import clsx from "clsx";

interface UnderlineLabelInputTextProps {
    value: string | null;
    onChange: (value: string | null) => void;
    label: string;
    required?: boolean;
    withValidation?: boolean;
}

const UnderlineLabelInputText = ({
    value,
    onChange,
    label,
    required = false,
    withValidation = false,
}: UnderlineLabelInputTextProps) => {

    // ************** Manejo de estados **************

    const id = useId();
    const refInput = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const errorActive = useMemo(() => isValid === false, [isValid]);

    // ************** Manejo de estilos **************

    const iconWithClass = useMemo(() => withClassName(<Text />, clsx(
        StyleModule.icon,
        errorActive ? StyleModule.iconError : StyleModule.iconValid
    )), [errorActive]);

    const [classNameLabel, classNameInput, classNameContainer] = useMemo(() => {
        const labelC = clsx(
            StyleModule.label,
            "nunito-semibold",
            (focused || (value && value.length > 0)) && StyleModule.labelFloating,
            (withValidation && errorActive && (!value || (typeof value === "string" && value.length === 0)) && focused) && StyleModule.labelError
        );
        const inputC = clsx(
            StyleModule.input,
            "nunito-regular",
            errorActive && StyleModule.inputError,
        );
        const containerC = clsx(
            StyleModule.container,
            errorActive && StyleModule.error
        );
        return [labelC, inputC, containerC];
    }, [focused, value, errorActive, withValidation]);

    // ************** Manejo de eventos **************

    const handleOnClickContainer = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        refInput.current?.focus({ preventScroll: true });
    }, []);

    const handleOnChangeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        onChange(v);
    }, [onChange]);

    const handleOnBlur = useCallback(() => {
        setFocused(false);
        const v = refInput.current?.value ?? "";
        setIsValid(withValidation ? (v && v.length > 0 ? true : false) : null);
    }, [withValidation]);

    const handleOnFocus = useCallback(() => {
        setFocused(true);
    }, []);

    // ************* Manejo de useEffect *************

    useEffect(() => {
        const v = value ?? "";
        setIsValid(withValidation ? ((v && v.length > 0) ? true : false) : null);
        if (!refInput.current) return;
    }, [value, withValidation]);

    return (
        <div className={classNameContainer} onClick={handleOnClickContainer}>
            <label htmlFor={id} className={classNameLabel}>
                {label}
            </label>
            <input
                id={id}
                ref={refInput}
                className={classNameInput}
                type="text"
                value={value ?? ""}
                onChange={handleOnChangeInput}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                {...(required && { required })}
            />
            {iconWithClass}
        </div>
    );
};

export default UnderlineLabelInputText;