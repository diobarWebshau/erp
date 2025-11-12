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
    isValidAsync?: (value: string, signal?: AbortSignal) => Promise<boolean>;
    messageValidAsync: string
}

const DEBOUNCE_MS = 100;

const UnderlineLabelInputText = ({
    value,
    onChange,
    label,
    required = false,
    withValidation = false,
    isValidAsync,
    messageValidAsync = "El campo ya esta ocupado"
}: UnderlineLabelInputTextProps) => {

    // ************** Manejo de referencias ***************

    const id = useId();
    const refInput = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showError, setShowError] = useState<boolean>(false);

    // ************** Manejo de estados **************

    const [focused, setFocused] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [checking, setChecking] = useState<boolean>(false);

    // ************** Variables de logica memoizadas **************

    const errorActive = useMemo(() => isValid === false, [isValid]);

    // ************** Validacion asincrona **************
    const validationLocal = useCallback((value: string) => {
        if (!withValidation) return true;
        const trimmed = (value ?? "").trim();
        if (required && trimmed.length === 0) return false;
        return true;
    }, [withValidation, required]);

    const validationAsync = useCallback(async (value: string) => {
        // Si no requiere validacion o no se le paso una funcion de asincrona, no hace nada
        if (!withValidation || !isValidAsync) return;
        // Elimina espacios en blanco al inicio y al final del valor
        const val = value.trim();
        // Cancelamos cualquier validacion previa
        abortRef.current?.abort();
        // Creamos un nuevo controlador de aborto
        const ac = new AbortController();
        // Asignamos el nuevo controlador a la referencia
        abortRef.current = ac;
        // Marcamos que se esta validando
        setChecking(true);
        try {
            // Llamamos a la funcion de validacion asincrona
            const ok = await isValidAsync(val, ac.signal);
            // Si la validacion no fue abortada, actualizamos el estado
            if (!ac.signal.aborted) {
                if (ok) {
                    setShowError(false);
                } else {
                    setShowError(true);
                }
                setIsValid(ok);
            }
        } catch {
            // Si existe un error, entonces y
            if (!ac.signal.aborted) setIsValid(false);
        } finally {
            // Si la validacion no fue abortada, marcamos que se termino de validar
            if (!ac.signal.aborted) setChecking(false);
        }

    }, [withValidation, isValidAsync]);

    // ************** Manejo de estilos **************

    const iconWithClass = useMemo(() => withClassName(<Text />, clsx(
        StyleModule.icon,
        errorActive ? StyleModule.iconError : StyleModule.iconValid
    )), [errorActive]);

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
            errorActive && StyleModule.inputError,
        );
        const containerC = clsx(
            StyleModule.container,
            errorActive && StyleModule.error
        );
        return [labelC, inputC, containerC];
    }, [focused, value, errorActive]);

    // ************** Manejo de eventos **************

    const handleOnClickContainer = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        refInput.current?.focus({ preventScroll: true });
    }, []);

    const handleOnChangeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        // Obtenemos el valor del input
        const v = e.target.value;
        // Actualizamos el valor
        onChange(v);

        // Si esta deshabilitada la validacion, no hace nada
        if (!withValidation) return;

        // Obtenemos las validacion local
        const localOk: boolean = validationLocal(v);

        // Si existe validacion asincrona, dejamos como null(indeterminado) mientras se verifica
        // Caso contrario, actualizamos el estatus de validacion directamente
        setIsValid(localOk ? (isValidAsync ? null : true) : false);

        // Si existe validacion asincrona y la validacion local es correcta, 
        if (isValidAsync && localOk) {
            // Si existe un timeout previo, lo cancelamos
            if (debounceRef.current) clearTimeout(debounceRef.current);
            // Creamos un nuevo timeout para la validacion asincrona
            console.log(`se valido`, v)
            debounceRef.current = setTimeout(() => {
                validationAsync(v);
            }, DEBOUNCE_MS);
        } else {
            // Si existe timeout previo
            if (debounceRef.current) {
                // Limpiamos el timeout
                clearTimeout(debounceRef.current);
                // Limpiamos la referencia del timeout
                debounceRef.current = null;
            }
            // Cancelamos cualquier validacion asincrona previa
            abortRef.current?.abort();
            // Marcamos que no se esta validando
            setChecking(false);
        }
    }, [
        onChange, withValidation, isValidAsync, validationLocal,
        validationAsync, debounceRef, abortRef, DEBOUNCE_MS
    ]);

    const handleOnBlur = useCallback(() => {
        // Marcamos que el input no tiene focus
        setFocused(false);
        // Si esta deshabilitada la validacion, no hace nada
        if (!withValidation) return;
        // Obtenemos el valor del input
        const value = refInput.current?.value ?? "";
        // Realizamos la validacion local
        const localOk = validationLocal(value);
        // Si existe validacion asincrona y la validacion local es correcta, 
        setIsValid(localOk ? (isValidAsync ? null : true) : false);
        // Si existe validacion asincrona y la validacion local es correcta, 
        if (isValidAsync && localOk) {
            // Si existe un timeout previo
            if (debounceRef.current) {
                // Limpiamos el timeout
                clearTimeout(debounceRef.current);
                // Limpiamos la referencia del timeout
                debounceRef.current = null;
            }
            // Creamos un nuevo timeout para la validacion asincrona
            debounceRef.current = setTimeout(() => {
                validationAsync(value);
            }, DEBOUNCE_MS);
        } else {
            // Si existe un timeout previo
            if (debounceRef.current) {
                // Cancelamos el timeout
                clearTimeout(debounceRef.current);
                // Limpiamos la referencia del timeout
                debounceRef.current = null;
            }
            // Cancelamos cualquier validacion asincrona previa
            abortRef.current?.abort();
            // Marcamos que no se esta validando
            setChecking(false);
        }
    }, [
        withValidation, refInput, validationLocal, isValidAsync,
        debounceRef, validationAsync, DEBOUNCE_MS, abortRef
    ]);

    const handleOnFocus = useCallback(() => {
        // Marcamos que el input tiene focus
        setFocused(true);
    }, []);

    // ************* Manejo de useEffect *************

    useEffect(() => {
        // Si no requiere validacion, resetea los estados
        if (!withValidation) {
            // Marcamos que no se esta validando
            setIsValid(null);
            // Marcamos que no se esta validando
            setChecking(false);
            // Cancelamos cualquier validacion asincrona previa
            abortRef.current?.abort();
            // Si existe timeout previo, lo cancelamos
            if (debounceRef.current) clearTimeout(debounceRef.current);
            return;
        }
        // Obtenemos el valor del input
        const v = value ?? "";
        // Realizamos la validacion local
        const localOk = validationLocal(v);
        // Si existe validacion asincrona y la validacion local es correcta, 
        setIsValid(localOk ? (isValidAsync ? null : true) : false);
    }, [value, withValidation, abortRef, debounceRef, validationLocal, isValidAsync]);

    return (
        <div>
            <div className={classNameContainer} onClick={handleOnClickContainer}>
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
            {
                showError && (
                    <small className={StyleModule.errorText}>
                        {messageValidAsync}
                    </small>
                )
            }
        </div>
    );
};

export default UnderlineLabelInputText;