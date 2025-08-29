import React, {
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import styles from "./CustomSelect.module.css";
import type { BaseRow } from "../../../types";

interface CustomSelectProps<T extends BaseRow> {
    value?: T | null; // valor seleccionado desde el padre
    options: T[];
    labelKey: keyof T;
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: Dispatch<SetStateAction<T | null>>; // actualización al padre
}

const CustomSelect = <T extends BaseRow>({
    options,
    labelKey,
    defaultLabel = "Selecciona una opción",
    autoOpen = true,
    onChange,
    value,
}: CustomSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // Label mostrado, derivado de `value`
    const selectedLabel = value ? String(value[labelKey]) : defaultLabel;

    // Abrir automáticamente al montar (opcional)
    useEffect(() => {
        if (autoOpen) {
            setIsOpen(true);
        }
    }, [autoOpen]);

    // Cerrar al hacer clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={styles.customSelect} ref={selectRef}>
            <div
                className={styles.toggle}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {selectedLabel}
            </div>
            {isOpen && (
                <div className={styles.options}>
                    {options.map((opt) => {
                        const label = String(opt[labelKey]);
                        const isSelected = value?.id === opt.id;
                        return (
                            <div
                                key={opt.id}
                                className={`${styles.option} ${isSelected ? styles.selected : ""}`}
                                onClick={() => {
                                    onChange?.(opt);
                                    setIsOpen(false);
                                }}
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
