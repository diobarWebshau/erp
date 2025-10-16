import { useMemo, type ChangeEvent, type JSX } from "react";
import styles from "./CheckBoxObjectListAutoSize.module.css";

type KeysOfStringOrNumber<T> = {
    [K in keyof T]-?: T[K] extends string | number ? K : never
}[keyof T];

interface CheckBoxObjectListAutoSizeProps<T extends Object> {
    /** Objetos actualmente seleccionados (controlado) */
    value: T[];
    /** Lista completa de opciones */
    options: T[];
    /** Devuelve la lista de objetos seleccionados */
    onChange: (selected: T[]) => void;

    /** Clave a mostrar como etiqueta */
    labelKey: keyof T;
    /** Clave única para comparar/identificar (string|number recomendado) */
    valueKey: KeysOfStringOrNumber<T>;

    classNameContainer?: string;
    classNameGroupOptions?: string;
    classNameOption?: string;
    classNameSelectedOption?: string;
    classNameInputOption?: string;

    /** Render label opcional si necesitas total control (tiene prioridad sobre labelKey) */
    renderLabel?: (item: T) => JSX.Element | string;
}

const sanitizeId = (str: string) => str.replace(/\s+/g, "_");

function CheckBoxObjectListAutoSize<T extends Object>({
    value,
    options,
    onChange,
    labelKey,
    valueKey,
    classNameContainer = "",
    classNameOption = "",
    classNameSelectedOption = "",
    classNameInputOption = "",
    renderLabel,
}: CheckBoxObjectListAutoSizeProps<T>) {
    // Helpers para obtener clave y label
    const getKey = (item: T) => String(item[valueKey] as string | number);
    const getLabel = (item: T) =>
        renderLabel ? renderLabel(item) : String(item[labelKey] ?? "");

    // Set de claves seleccionadas para isSelected O(1)
    const selectedKeySet = useMemo(() => {
        const s = new Set<string>();
        for (const it of value) s.add(getKey(it));
        return s;
    }, [value, valueKey]);

    // Toggle controlado: no guardamos estado interno; derivamos de props.value
    const handleToggle = (e: ChangeEvent<HTMLInputElement>, option: T) => {
        const checked = e.target.checked;
        const k = getKey(option);

        if (checked) {
            // Evitar duplicados si ya estaba
            if (!selectedKeySet.has(k)) {
                onChange([...value, option]);
            }
        } else {
            if (selectedKeySet.has(k)) {
                onChange(value.filter((v) => getKey(v) !== k));
            }
        }
    };

    return (
        <div className={`${styles.groupOptions} ${classNameContainer}`}>
            {options.map((option) => {
                const k = getKey(option);
                const isSelected = selectedKeySet.has(k);
                const optionId = sanitizeId(k);
                return (
                    <label
                        htmlFor={optionId}
                        key={k}
                        className={`${styles.option} ${classNameOption} ${isSelected ? styles.selected : ""} ${isSelected ? classNameSelectedOption : ""
                            }`}
                    >
                        <input
                            id={optionId}
                            type="checkbox"
                            className={`${styles.inputCheckbox} ${classNameInputOption}`}
                            checked={isSelected}
                            onChange={(e) => handleToggle(e, option)}
                        />
                        {getLabel(option)}
                    </label>
                );
            })}
        </div>
    );
}

export default CheckBoxObjectListAutoSize;
