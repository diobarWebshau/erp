import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import withClassName from "../../../../../../utils/withClassName";
import type { ChangeEvent, MouseEvent } from "react"
import StyleModule from "./UnderlineLabelInputPhone.module.css";
import { Phone } from "lucide-react";
import { isPhone } from "../../../../../../helpers/validations";
import clsx from "clsx";

interface UnderlineLabelInputPhoneProps {
    value: string | null;
    onChange: (value: string | null) => void;
    label: string;
    required?: boolean;
    withValidation?: boolean;
}

const UnderlineLabelInputPhone = ({
    value,
    onChange,
    label,
    required = false,
    withValidation = false
}: UnderlineLabelInputPhoneProps) => {

    // ************** Manejo de estados **************

    const id = useId();
    const refInput = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const errorActive = useMemo(() => isValid === false, [isValid]);

    // ************** Manejo de estilos **************

    const iconWithClass = useMemo(() => withClassName(<Phone />, clsx(
        StyleModule.icon,
        errorActive ? StyleModule.iconError : StyleModule.iconValid
    )), [errorActive]);

    const [classNameLabel, classNameInput, classNameContainer] = useMemo(() => {
        const labelC = clsx(
            StyleModule.label,
            "nunito-semibold",
            (focused || (value && value.length > 0)) && StyleModule.floating,
            // errorActive ? StyleModule.labelError : StyleModule.labelValid
            (errorActive && focused) && StyleModule.labelError
        );
        const inputC = clsx(
            StyleModule.input,
            "nunito-regular",
            errorActive && StyleModule.inputError,
            // errorActive ? StyleModule.inputError : StyleModule.inputValid
        );
        const containerC = clsx(
            StyleModule.container,
            errorActive && StyleModule.error
        );
        return [labelC, inputC, containerC];
    }, [focused, value, errorActive]);

    // ************** Manejo de eventos **************

    const handleOnClickContainer = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            refInput.current?.focus({ preventScroll: true });
        },
        []
    );

    const handleOnChangeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        onChange(v);
    }, [onChange]);

    const handleOnBlur = useCallback(() => {
        setFocused(false);
        const v = refInput.current?.value ?? "";
        setIsValid(withValidation ? isPhone(v) : null);
    }, []);

    const handleOnFocus = useCallback(() => {
        setFocused(true);
    }, []);


    // ************* Manejo de useEffect *************

    useEffect(() => {
        const v = value ?? "";
        if (!refInput.current) return;
        setIsValid(withValidation ? isPhone(v) : null);
    }, [value]);

    return (
        <div className={classNameContainer} onClick={handleOnClickContainer}>
            <label htmlFor={id} className={classNameLabel}>
                {label}
            </label>
            <input
                id={id}
                ref={refInput}
                className={classNameInput}
                type="tel"
                value={value ?? ""}
                onChange={handleOnChangeInput}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                autoComplete="tel"
                inputMode="tel"
                {...(required && { required })}
            />
            {iconWithClass}
        </div>
    );
};

export default UnderlineLabelInputPhone;
