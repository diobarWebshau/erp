import React, { useEffect, useState } from "react";
import styles from "./ObjectSelect.module.css";

import {
    useFloating,
    offset,
    flip,
    shift,
    size,
    hide,
    autoUpdate,
    useRole,
    useClick,
    useDismiss,
    useInteractions,
    FloatingPortal,
    FloatingFocusManager,
} from "@floating-ui/react";

interface ObjectSelectProps<T> {
    value?: T | null | undefined; // valor seleccionado desde el padre
    options: T[];                  // opciones a mostrar
    labelKey: keyof T;             // key para mostrar en el label
    defaultLabel?: string;         // texto por defecto
    autoOpen?: boolean;            // abrir automáticamente al montar
    onChange?: ((value: T | null | undefined) => void); // callback al seleccionar
    icon?: React.ReactNode;        // icono del toggle
    classNameContainer?: string;
    classNameFieldContainer?: string;
    classNameToggleContainer?: string;
    classNameOption?: string;
    classNameOptionSelected?: string;
    classNameOptionValidate?: string;
}

const ObjectSelect = <T,>({
    options,
    labelKey,
    defaultLabel = "Selecciona una opción",
    autoOpen = true,
    onChange,
    value,
    icon,
    classNameContainer,
    classNameFieldContainer,
    classNameToggleContainer,
    classNameOption,
    classNameOptionSelected,
}: ObjectSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false); // estado del popover abierto/cerrado

    // Obtenemos el label que se muestra en el trigger
    const selectedLabel = value ? String(value[labelKey]) : defaultLabel;

    // CONFIGURACIÓN DE FLOATING UI
    const { refs, floatingStyles, context, middlewareData } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen, // sincronizamos el estado interno
        placement: "bottom-start", // abrir abajo a la izquierda
        strategy: "fixed", // posición fija para evitar saltos dentro de modales/scrolls
        whileElementsMounted(reference, floating, update) {
            // autoUpdate recalcula posición en scroll, resize o cambio de tamaño del trigger
            return autoUpdate(reference, floating, update, {
                ancestorScroll: true,
                ancestorResize: true,
                elementResize: true,
            });
        },
        middleware: [
            offset(4), // separación entre trigger y popover
            flip({ padding: 8 }), // voltea si no hay espacio abajo
            shift({ padding: 8, crossAxis: false }), // ajusta lateral si se sale
            size({
                padding: 8,
                apply({ rects, availableWidth, availableHeight, elements }) {
                    // ajusta tamaño del popover dinámicamente
                    Object.assign(elements.floating.style, {
                        width: "auto", // ancho dinámico
                        minWidth: `${rects.reference.width}px`, // al menos igual al trigger
                        maxWidth: `${availableWidth}px`,
                        maxHeight: `${availableHeight}px`,
                        zIndex: 9999,
                    });
                },
            }),
            hide({ strategy: "referenceHidden" }), // detecta si trigger quedó fuera de viewport
        ],
    });

    // CONFIGURACIÓN DE INTERACCIONES
    const role = useRole(context, { role: "listbox" });
    const click = useClick(context, { event: "mousedown" }); // abrir popover al click
    const dismiss = useDismiss(context, {
        outsidePress: true,
        escapeKey: true,
        ancestorScroll: true, // cerrar al scrollear fuera
    });
    const { getReferenceProps, getFloatingProps } = useInteractions([
        role,
        click,
        dismiss,
    ]);

    // autoOpen opcional al montar el componente
    useEffect(() => {
        if (autoOpen) setIsOpen(true);
    }, [autoOpen]);

    return (
        <div className={`${styles.customSelect} ${classNameContainer}`}>
            {/* TRIGGER DEL SELECT */}
            <div
                className={
                    `nunito-semibold ${styles.fieldSelectContainer} ` +
                    `${value ? styles.fieldSelectContainerValidate : styles.fieldSelectContainerInvalid} ` +
                    `${classNameFieldContainer} ${!value ? styles.fieldSelectDefault : ""}`
                }
                ref={refs.setReference} // referencia para floating UI
                {...getReferenceProps()} // props de interacción
                tabIndex={0} // accesibilidad
                role="button"
                onKeyDown={e => {
                    // abrir con teclado o cerrar con Escape
                    if (["Enter", " ", "ArrowDown"].includes(e.key)) setIsOpen(true);
                    if (e.key === "Escape") setIsOpen(false);
                }}
                style={{ cursor: "pointer", userSelect: "none" }}
            >
                {selectedLabel}
                <button type="button" className={styles.iconButton} tabIndex={-1}>
                    {icon}
                </button>
            </div>

            {/* POPOVER */}
            {isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                        <div
                            ref={refs.setFloating} // referencia del popover
                            style={{
                                ...floatingStyles,
                                // ocultamos visualmente si el trigger quedó fuera
                                opacity: middlewareData.hide?.referenceHidden ? 0 : 1,
                                pointerEvents: middlewareData.hide?.referenceHidden ? "none" : "auto",
                                transition: "opacity 0.1s ease",
                            }}
                            className={`nunito-semibold ${styles.toggle} ${classNameToggleContainer}`}
                            role="listbox"
                            {...getFloatingProps()}
                        >
                            {options.map(opt => {
                                const label = String(opt[labelKey]);
                                const isSelected = value?.[labelKey] === opt[labelKey];
                                return (
                                    <div
                                        key={String(opt[labelKey])}
                                        className={`${styles.option} ${isSelected ? `${styles.selected} ${classNameOptionSelected}` : ""} ${classNameOption}`}
                                        role="option"
                                        tabIndex={0}
                                        onMouseDown={e => {
                                            e.preventDefault(); // evita perder foco
                                            onChange?.(opt); // selecciona opción
                                            setIsOpen(false); // cierra popover
                                        }}
                                        onKeyDown={e => {
                                            if (["Enter", " "].includes(e.key)) {
                                                onChange?.(opt);
                                                setIsOpen(false);
                                            }
                                        }}
                                        style={{ flexWrap: "nowrap" }}
                                    >
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    );
};

export default ObjectSelect;
