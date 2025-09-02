import React, {
    useEffect,
    useRef,
    useState,
} from "react";
import styles from "./CustomSelect.module.css";

interface CustomSelectProps<T extends string> {
    value?: T;
    options: T[];
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: (value: T) => void;
    classNameContainer?: string;
    classNameToggle?: string;
    classNameOption?: string;
    classNameOptionSelected?: string;
    icon?: React.ReactNode;
}

const CustomSelect = <T extends string>({
    options,
    defaultLabel = "Selecciona una opción",
    autoOpen = true,
    onChange,
    value,
    classNameContainer,
    classNameToggle,
    classNameOption,
    classNameOptionSelected,
    icon,
}: CustomSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // Label mostrado, derivado de `value`
    const selectedLabel = value ? String(value) : defaultLabel;

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

    const handlerOnChange = (value: T) => {
        onChange?.(value);
        setIsOpen(false);
    };

    return (
        <div className={`${styles.customSelect} ${classNameContainer}`} ref={selectRef}>
            <div
                className={`${styles.fieldSelect} ${classNameToggle}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {selectedLabel}
                <button
                    className={styles.iconButton}
                >
                    {icon}
                </button>
            </div>
            {isOpen && (
                <div className={`${styles.toggle} ${classNameToggle}`}>
                    {options.map((opt) => {
                        const label = String(opt);
                        const isSelected = value === opt;
                        return (
                            <div
                                key={opt.toString()}
                                className={
                                    `${styles.option} ${classNameOption} ` +
                                    `${isSelected && styles.optionSelected}`}
                                onClick={() => handlerOnChange(opt)}
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
