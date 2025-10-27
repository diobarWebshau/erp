import { useEffect, useState, type ChangeEvent, useCallback } from "react";
import styles from "./BooleanSwitchAutoSize.module.css";

interface BooleanByIndexAutoSizeProps {
    value?: 0 | 1 | null;
    options?: [string, string];
    onChange: (selected: 0 | 1 | null) => void;
    classNameContainer?: string;
    classNameGroupOptions?: string;
    classNameOption?: string;
    classNameSelectedOption?: string;
    classNameInputOption?: string;
}

const CheckBoxBooleanAutoSize = ({
    value,
    options,
    onChange,
    classNameContainer = "",
    classNameGroupOptions = "",
    classNameOption = "",
    classNameSelectedOption = "",
    classNameInputOption = "",
}: BooleanByIndexAutoSizeProps) => {

    console.log(options);

    const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(() => value ?? null);

    useEffect(() => {
        setSelectedIndex(value ?? null);
    }, [value]);

    // Normaliza: exactamente 2 etiquetas
    const labels: [string, string] = [
        options?.[0] ?? "No",
        options?.[1] ?? "Yes",
    ];

    const handleToggle = useCallback(
        (e: ChangeEvent<HTMLInputElement>, idx: 0 | 1) => {
            const next: 0 | 1 | null = e.target.checked ? idx : null;
            setSelectedIndex(next);
            onChange(next);
        },
        [onChange]
    );

    return (
        <div className={`${styles.groupOptions} ${classNameContainer} ${classNameGroupOptions}`}>
            {[0, 1].map((i) => {
                const isSelected = selectedIndex === (i as 0 | 1);
                const optionId = `bool-opt-${i}`; // <-- id/key por índice (sin colisiones)

                return (
                    <label
                        htmlFor={optionId}
                        key={optionId}
                        className={`${styles.option} ${classNameOption} ${isSelected ? styles.selected : ""} ${isSelected ? classNameSelectedOption : ""}`}
                    >
                        <input
                            id={optionId}
                            type="checkbox"
                            className={`${styles.inputCheckbox} ${classNameInputOption}`}
                            checked={isSelected}
                            onChange={(e) => handleToggle(e, i as 0 | 1)}
                        />
                        {labels[i as 0 | 1]}
                    </label>
                );
            })}
        </div>
    );
};

export default CheckBoxBooleanAutoSize;
