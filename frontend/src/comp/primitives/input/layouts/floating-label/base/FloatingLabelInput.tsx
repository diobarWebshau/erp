import { useCallback, useId, useMemo, useRef, useState } from "react";
import withClassName from "../../../../../../utils/withClassName";
import type { ChangeEvent, MouseEvent } from "react";
import StyleModule from "./FloatingLabelInput.module.css";
import { MailIcon } from "lucide-react";
import clsx from "clsx";

interface MailInputProps {
    value: string,
    onChange: (value: string) => void,
    label: string,
}

const MailInput = ({ value, onChange, label }: MailInputProps) => {

    const id = useId();
    const refInput = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);

    // al cambiar el valor del input, se llama a la función onChange
    const handleOnChangeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }, [onChange]);

    // al hacer click en el contenedor, se enfoca el input
    const handleOnClickContainer = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        refInput.current?.focus({ preventScroll: true });
    }, [refInput]);

    // icono con la clase del módulo
    const iconWithClass = useMemo(() => withClassName(<MailIcon />, StyleModule.icon), []);

    // label con la clase del módulo
    const classNameLabel = useMemo(() => clsx(
        StyleModule.label,
        (focused || value.length > 0) && StyleModule.floating
    ), [focused, value]);

    return (
        <div className={StyleModule.container} onClick={handleOnClickContainer}>
            <label htmlFor={id} className={classNameLabel}>{label}</label>
            <input
                id={id}
                ref={refInput}
                className={StyleModule.input}
                type="email"
                value={value}
                onChange={handleOnChangeInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                autoCapitalize="none"
                placeholder="" /* opcional: deja vacío para no “competir” con el label flotante */
            />
            {iconWithClass}
        </div>
    );
};

export default MailInput;
