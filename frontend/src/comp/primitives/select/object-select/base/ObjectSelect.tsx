// import React, {
//     useEffect,
//     useRef,
//     useState,
//     type Dispatch,
//     type SetStateAction,
// } from "react";
// import styles from "./CustomSelect.module.css";
// import type { BaseRow } from "../../../types";

// interface CustomSelectProps<T extends BaseRow> {
//     value?: T | null | undefined; // valor seleccionado desde el padre
//     options: T[];
//     labelKey: keyof T;
//     defaultLabel?: string;
//     autoOpen?: boolean;
//     onChange?: ((value: T | null | undefined) => void); // actualización al padre
//     icon?: React.ReactNode;
// }

// const CustomSelectObject = <T extends BaseRow>({
//     options,
//     labelKey,
//     defaultLabel = "Selecciona una opción",
//     autoOpen = true,
//     onChange,
//     value,
//     icon,
// }: CustomSelectProps<T>) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const selectRef = useRef<HTMLDivElement>(null);

//     // Label mostrado, derivado de `value`
//     const selectedLabel = value ? String(value[labelKey]) : defaultLabel;

//     // Abrir automáticamente al montar (opcional)
//     useEffect(() => {
//         if (autoOpen) {
//             setIsOpen(true);
//         }
//     }, [autoOpen]);

//     // Cerrar al hacer clic fuera del componente
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (
//                 selectRef.current &&
//                 !selectRef.current.contains(event.target as Node)
//             ) {
//                 setIsOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     return (
//         <div className={styles.customSelect} ref={selectRef}>
//             <div className={`nunito-semibold ${styles.fieldSelectContainer}`}
//                 onClick={() => setIsOpen((prev) => !prev)}
//             >
//                 {selectedLabel}
//                 <button className={styles.iconButton}>
//                     {icon}
//                 </button>
//             </div>
//             {isOpen && (
//                 <div className={`nunito-semibold ${styles.toggle}`}>
//                     {options.map((opt) => {
//                         const label = String(opt[labelKey]);
//                         const isSelected = value?.id === opt.id;
//                         return (
//                             <div
//                                 key={opt.id}
//                                 className={`${styles.option} ${isSelected ? styles.selected : ""}`}
//                                 onClick={() => {
//                                     onChange?.(opt);
//                                     setIsOpen(false);
//                                 }}
//                             >
//                                 {label}
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CustomSelectObject;

import React, { useEffect, useState } from "react";
import styles from "./ObjectSelect.module.css";
import type { BaseRow } from "../../../../../interfaces/globalTypes";

import {
    useFloating,
    offset,
    flip,
    shift,
    size,
    autoUpdate,
    useRole,
    useClick,
    useDismiss,
    useInteractions,
    FloatingPortal,
    FloatingFocusManager,
} from "@floating-ui/react";

interface ObjectSelectCustomProps<T extends BaseRow> {
    value?: T | null | undefined; // valor seleccionado desde el padre
    options: T[];
    labelKey: keyof T;
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: ((value: T | null | undefined) => void);
    icon?: React.ReactNode;
    classNameContainer?: string;
    classNameFieldContainer?: string;
    classNameToggleContainer?: string;
    classNameOption?: string;
    classNameOptionSelected?: string;
    classNameOptionValidate?: string;
}

const ObjectSelect = <T extends BaseRow>({
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
}: ObjectSelectCustomProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);

    // Label mostrado, derivado de `value`
    const selectedLabel = value ? String(value[labelKey]) : defaultLabel;

    // Floating UI setup
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: "bottom-start",
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(4),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        minWidth: `${rects.reference.width}px`,
                        zIndex: 9999,
                    });
                }
            }),
        ],
    });

    // Interacciones Floating UI
    const role = useRole(context, { role: "listbox" });
    const click = useClick(context, { event: "mousedown" });
    const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true });
    const { getReferenceProps, getFloatingProps } = useInteractions([
        role,
        click,
        dismiss,
    ]);

    // autoOpen al montar
    useEffect(() => {
        if (autoOpen) setIsOpen(true);
    }, [autoOpen]);

    return (
        <div className={`${styles.customSelect} ${classNameContainer}`}>
            <div
                className={`nunito-semibold ${styles.fieldSelectContainer} ${value ? styles.fieldSelectContainerValidate : styles.fieldSelectContainerInvalid} ${classNameFieldContainer}`}
                ref={refs.setReference}
                {...getReferenceProps()}
                tabIndex={0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") setIsOpen(true);
                    if (e.key === "Escape") setIsOpen(false);
                }}
                style={{ cursor: "pointer", userSelect: "none" }}
            >
                {selectedLabel}
                <button
                    type="button"
                    className={styles.iconButton}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    {icon}
                </button>
            </div>

            {isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className={`nunito-semibold ${styles.toggle} ${classNameToggleContainer}`}
                            role="listbox"
                            {...getFloatingProps()}
                        >
                            {options.map((opt) => {
                                const label = String(opt[labelKey]);
                                const isSelected = value?.id === opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        className={`${styles.option} ${isSelected ? `${styles.selected} ${classNameOptionSelected}` : ""} ${classNameOption}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        tabIndex={0}
                                        onMouseDown={e => {
                                            e.preventDefault(); // Evita perder el focus antes de seleccionar
                                            onChange?.(opt);
                                            setIsOpen(false);
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                onChange?.(opt);
                                                setIsOpen(false);
                                            }
                                        }}
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
