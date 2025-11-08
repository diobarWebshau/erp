import { MailIcon } from "lucide-react";
import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type MouseEvent,
} from "react";
import clsx from "clsx";
import StyleModule from "./MailInput.module.css";
import withClassName from "../../../../../utils/withClassName";

interface MailInputProps {
    value: string,
    onChange: (value: string) => void,
    label: string,
    mainColor?: string,
}

const MailInput = ({ value, onChange, label }: MailInputProps) => {
    const id = useId();
    const refInput = useRef<HTMLInputElement>(null);

    const [focused, setFocused] = useState(false);
    const [touched, setTouched] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Si value cambia desde afuera y YA fue tocado, revalida; si no, queda neutral.
    useEffect(() => {
        const v = value ?? "";
        if (!refInput.current) return;

        if (!touched) {
            setIsValid(null);  // neutral hasta que ocurra el primer blur
            return;
        }
        setIsValid(v.length === 0 ? null : refInput.current.checkValidity());
    }, [value, touched]);

    const handleOnChangeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        onChange(v);
        // Solo revalidamos mientras se escribe si ya estuvo "touched"
        if (touched) {
            setIsValid(v.length === 0 ? null : e.target.validity.valid);
        }
    }, [onChange, touched]);

    const handleOnClickContainer = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        refInput.current?.focus({ preventScroll: true });
    }, []);

    const iconWithClass = useMemo(() => withClassName(<MailIcon />, StyleModule.icon), []);

    // UNA sola verdad para el error: solo tras blur y si es inválido
    const errorActive = touched && isValid === false;

    const classNameContainer = useMemo(() => clsx(
        StyleModule.container,
        errorActive && StyleModule.error
    ), [errorActive]);

    const [classNameLabel, classNameInput] = useMemo(() => {
        const labelC = clsx(
            StyleModule.label,
            "nunito-semibold",
            (focused || value.length > 0) && StyleModule.floating,
            errorActive && StyleModule.labelError     // misma condición
        );
        const inputC = clsx(
            StyleModule.input,
            "nunito-regular",
            errorActive && StyleModule.inputError     // misma condición
        );
        return [labelC, inputC];
    }, [focused, value, errorActive]);

    return (
        <div className={classNameContainer} onClick={handleOnClickContainer}>
            <label htmlFor={id} className={classNameLabel}>{label}</label>

            <input
                id={id}
                ref={refInput}
                className={classNameInput}
                type="email"
                value={value}
                onChange={handleOnChangeInput}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                    setFocused(false);
                    setTouched(true); // primer blur: desde ahora sí mostramos errores
                    const v = refInput.current?.value ?? "";
                    setIsValid(v.length === 0 ? null : (refInput.current?.checkValidity() ?? null));
                }}
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                autoCapitalize="none"
                placeholder="" /* evita competir con el label flotante */
                aria-invalid={errorActive ? "true" : "false"}
                aria-describedby={errorActive ? `${id}-err` : undefined}
                required /* quítalo si NO quieres que sea obligatorio */
            />

            {iconWithClass}
        </div>
    );
};

export default MailInput;
