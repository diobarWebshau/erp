import React, {
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import styles from "./CustomSelectCheck.module.css";
import type { BaseRow } from "../../../types";

interface CustomSelectCheckProps<T extends BaseRow> {
    value?: T[]; // múltiples valores seleccionados
    options: T[];
    labelKey: keyof T;
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: Dispatch<SetStateAction<T[]>>; // actualiza array seleccionado
}

const CustomSelectCheck = <T extends BaseRow>({
    options,
    labelKey,
    defaultLabel = "Selecciona opciones",
    autoOpen = true,
    onChange,
    value = [],
}: CustomSelectCheckProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectedIds = value.map((v) => v.id);

    const getSelectedLabel = () => {
        if (value.length === 0) return defaultLabel;
        if (value.length <= 2) {
            return value.map((v) => v[labelKey]).join(", ");
        }
        return `${value.length} seleccionados`;
    };

    const toggleOption = (opt: T) => {
        const exists = selectedIds.includes(opt.id);
        let updated: T[];
        if (exists) {
            updated = value.filter((v) => v.id !== opt.id);
        } else {
            updated = [...value, opt];
        }
        onChange?.(updated);
    };

    useEffect(() => {
        if (autoOpen) setIsOpen(true);
    }, [autoOpen]);

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
        <div className={styles.container} ref={selectRef}>
            <div
                className={styles.toggle}
                // onClick={() => setIsOpen((prev) => !prev)}
            >
                {getSelectedLabel()}
            </div>

            {isOpen && (
                <div className={styles.options}>
                    {options.map((opt) => {
                        const label = String(opt[labelKey]);
                        const isChecked = selectedIds.includes(opt.id);
                        return (
                            <label
                                key={opt.id}
                                className={`${styles.option} ${isChecked ? styles.selected : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleOption(opt)}
                                    className={styles.checkbox}
                                />
                                <span>{label}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomSelectCheck;
