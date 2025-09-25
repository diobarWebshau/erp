// import React, {
//     useEffect,
//     useRef,
//     useState,
// } from "react";
// import styles from "./CustomSelect.module.css";

// interface CustomSelectProps<T extends string> {
//     value?: T;
//     options: T[];
//     defaultLabel?: string;
//     autoOpen?: boolean;
//     onChange?: (value: T) => void;
//     classNameContainer?: string;
//     classNameToggle?: string;
//     classNameOption?: string;
//     classNameOptionSelected?: string;
//     icon?: React.ReactNode;
// }

// const CustomSelect = <T extends string>({
//     options,
//     defaultLabel = "Selecciona una opción",
//     autoOpen = true,
//     onChange,
//     value,
//     classNameContainer,
//     classNameToggle,
//     classNameOption,
//     classNameOptionSelected,
//     icon,
// }: CustomSelectProps<T>) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const selectRef = useRef<HTMLDivElement>(null);

//     // Label mostrado, derivado de `value`
//     const selectedLabel = value ? String(value) : defaultLabel;

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

//     const handlerOnChange = (value: T) => {
//         onChange?.(value);
//         setIsOpen(false);
//     };

//     return (
//         <div className={`${styles.customSelect} ${classNameContainer}`} ref={selectRef}>
//             <div
//                 className={`nunito-semibold ${styles.fieldSelect} ${classNameToggle}`}
//                 onClick={() => setIsOpen((prev) => !prev)}
//             >
//                 {selectedLabel}
//                 <button
//                     className={styles.iconButton}
//                 >
//                     {icon}
//                 </button>
//             </div>
//             {isOpen && (
//                 <div className={`${styles.toggle} ${classNameToggle}`}>
//                     {options.map((opt) => {
//                         const label = String(opt);
//                         const isSelected = value === opt;
//                         return (
//                             <div
//                                 key={opt.toString()}
//                                 className={
//                                     `nunito-semibold ${styles.option} ${classNameOption} ` +
//                                     `${isSelected && styles.optionSelected}`}
//                                 onClick={() => handlerOnChange(opt)}
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

// export default CustomSelect;

import React, { useEffect, useState } from "react";
import styles from "./StandarSelect.module.css";
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

interface StandarSelectProps<T extends string> {
    value?: T;
    options: T[];
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: (value: T) => void;
    icon?: React.ReactNode;
    classNameContainer?: string;
    classNameFieldContainer?: string;
    classNameToggleContainer?: string;
    classNameOption?: string;
    classNameOptionSelected?: string;
}

const StandarSelect = <T extends string>({
    options,
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
}: StandarSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);

    console.log(`value: ${value}`);

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

    const selectedLabel = value ? String(value) : defaultLabel;

    const handlerOnChange = (value: T) => {
        onChange?.(value);
        setIsOpen(false);
    };


    
    return (
        <div className={`${styles.customSelect} ${classNameContainer ?? ""}`}>
            <div
                className={
                    `nunito-semibold ${styles.fieldSelectContainer} `+
                    `${value ? styles.fieldSelectContainerValidate : styles.fieldSelectContainerInvalid} ${classNameFieldContainer} ` +
                    `${!value && styles.fieldSelectDefault}`
                }
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
                            className={`nunito-semibold ${styles.toggle} ${classNameToggleContainer ?? ""}`}
                            role="listbox"
                            {...getFloatingProps()}
                        >
                            {options.map((opt) => {
                                const label = String(opt);
                                const isSelected = value === opt;
                                return (
                                    <div
                                        key={opt}
                                        className={
                                            `${styles.option} ${classNameOption ?? ""} ` +
                                            `${isSelected ? `${styles.selected} ${classNameOptionSelected ?? ""}` : ""}`
                                        }
                                        role="option"
                                        aria-selected={isSelected}
                                        tabIndex={0}
                                        onMouseDown={e => {
                                            e.preventDefault();
                                            handlerOnChange(opt);
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                handlerOnChange(opt);
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

export default StandarSelect;
