import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import withClassName from "../../../../../../utils/withClassName";
import StyleModule from "./UnderlineLabelInputText.module.css";
import type { ChangeEvent, MouseEvent } from "react";
import { Text } from "lucide-react";
import clsx from "clsx";

interface UnderlineLabelInputTextProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    required?: boolean;
    withValidation?: boolean;
    /** true = válido/disponible, false = inválido/ocupado */
    isValidAsync?: (value: string, signal?: AbortSignal) => Promise<boolean>;
}

const DEBOUNCE_MS = 500;

const UnderlineLabelInputText = ({
    value,
    onChange,
    label,
    required = false,
    withValidation = false,
    isValidAsync,
}: UnderlineLabelInputTextProps) => {
    // ************** Estado / refs **************
    const id = useId();
    const refInput = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null); // null = indeterminado
    const [checking, setChecking] = useState(false);
    const errorActive = useMemo(() => isValid === false, [isValid]);

    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ************** Validación local **************
    const validateLocal = useCallback(
        (v: string) => {
            if (!withValidation) return true;
            const trimmed = (v ?? "").trim();
            if (required && trimmed.length === 0) return false;
            // aquí podrías agregar más reglas (regex, longitud, etc.)
            return true;
        },
        [withValidation, required]
    );

    // ************** Chequeo asíncrono **************
    const runAsyncCheck = useCallback(
        async (raw: string) => {
            if (!withValidation || !isValidAsync) return;
            const val = raw.trim();
            if (!validateLocal(val)) return;

            // cancelar request anterior
            abortRef.current?.abort();
            const ac = new AbortController();
            abortRef.current = ac;

            setChecking(true);
            try {
                const ok = await isValidAsync(val, ac.signal);
                if (!ac.signal.aborted) {
                    setIsValid(ok);
                }
            } catch {
                if (!ac.signal.aborted) {
                    // en error de red/servidor: marca inválido o deja estado previo; aquí marcamos inválido
                    setIsValid(false);
                }
            } finally {
                if (!ac.signal.aborted) setChecking(false);
            }
        },
        [withValidation, isValidAsync, validateLocal]
    );

    // ************** Estilos **************
    const iconWithClass = useMemo(
        () =>
            withClassName(
                <Text />,
                clsx(
                    StyleModule.icon,
                    checking
                        ? StyleModule.iconChecking
                        : errorActive
                            ? StyleModule.iconError
                            : StyleModule.iconValid
                )
            ),
        [errorActive, checking]
    );

    const [classNameLabel, classNameInput, classNameContainer] = useMemo(() => {
        const labelC = clsx(
            StyleModule.label,
            "nunito-semibold",
            (focused || value.length > 0) && StyleModule.floating,
            (errorActive && value.length === 0 && focused) && StyleModule.labelError
        );
        const inputC = clsx(
            StyleModule.input,
            "nunito-regular",
            errorActive && StyleModule.inputError
        );
        const containerC = clsx(
            StyleModule.container,
            errorActive && StyleModule.error
        );
        return [labelC, inputC, containerC];
    }, [focused, value, errorActive]);

    // ************** Eventos **************
    const handleOnClickContainer = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        refInput.current?.focus({ preventScroll: true });
    }, []);

    const handleOnChangeInput = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            onChange(v);

            if (!withValidation) return;

            // validación local inmediata
            const localOk = validateLocal(v);
            // si habrá chequeo remoto, deja null (indeterminado) mientras se verifica
            setIsValid(localOk ? (isValidAsync ? null : true) : false);

            // debounce del chequeo remoto
            if (isValidAsync && localOk) {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    runAsyncCheck(v);
                }, DEBOUNCE_MS);
            } else {
                // cortar cualquier pendiente
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                }
                abortRef.current?.abort();
                setChecking(false);
            }
        },
        [onChange, withValidation, isValidAsync, validateLocal, runAsyncCheck]
    );

    const handleOnBlur = useCallback(() => {
        setFocused(false);
        if (!withValidation) return;

        const v = refInput.current?.value ?? "";
        const localOk = validateLocal(v);
        setIsValid(localOk ? (isValidAsync ? null : true) : false);

        // en blur, fuerza el chequeo remoto inmediato (sin debounce)
        if (isValidAsync && localOk) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            runAsyncCheck(v);
        }
    }, [withValidation, isValidAsync, validateLocal, runAsyncCheck]);

    const handleOnFocus = useCallback(() => {
        setFocused(true);
    }, []);

    // ************** Effects **************
    // sincroniza cuando cambia value desde “afuera” (reset/edición)
    useEffect(() => {
        if (!withValidation) {
            setIsValid(null);
            setChecking(false);
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            return;
        }
        const localOk = validateLocal(value ?? "");
        setIsValid(localOk ? (isValidAsync ? null : true) : false);
    }, [value, withValidation, isValidAsync, validateLocal]);

    // limpieza al desmontar
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // ************** Render **************
    return (
        <div
            className={classNameContainer}
            onClick={handleOnClickContainer}
            aria-invalid={errorActive || undefined}
            aria-busy={checking || undefined}
        >
            <label htmlFor={id} className={classNameLabel}>
                {label}
            </label>
            <input
                id={id}
                ref={refInput}
                className={classNameInput}
                type="text"
                value={value}
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
