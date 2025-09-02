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
    value?: T | null | undefined; // valor seleccionado desde el padre
    options: T[];
    labelKey: keyof T;
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: Dispatch<SetStateAction<T | null | undefined>> | ((value: T | null | undefined) => void); // actualización al padre
    icon?: React.ReactNode;
}

const CustomSelectObject = <T extends BaseRow>({
    options,
    labelKey,
    defaultLabel = "Selecciona una opción",
    autoOpen = true,
    onChange,
    value,
    icon,
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
            <div className={`nunito-semibold ${styles.fieldSelectContainer}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {selectedLabel}
                <button className={styles.iconButton}>
                    {icon}
                </button>
            </div>
            {isOpen && (
                <div className={`nunito-semibold ${styles.toggle}`}>
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

export default CustomSelectObject;
