import type { JSX } from "react";
import CheckBoxObjectListAutoSize from "../base/CheckBoxObjectListAutoSize";
import StylesModule from "./CheckBoxObjectListAutoSizeCustom.module.css";
import clsx from "clsx";

type KeysOfStringOrNumber<T> = {
    [K in keyof T]-?: T[K] extends string | number ? K : never
}[keyof T];

interface CheckBoxObjectListAutoSizeCustomProps<T extends Object> {
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
    /** Render label opcional si necesitas total control (tiene prioridad sobre labelKey) */
    renderLabel?: (item: T) => JSX.Element | string;
    /** Clase personalizada para el contenedor */
    classNameContainer?: string;
    classNameOption?: string;
    classNameSelectedOption?: string;
}

const CheckBoxObjectListAutoSizeCustom = <T extends Object>({
    value,
    options,
    onChange,
    labelKey,
    valueKey,
    renderLabel,
    classNameContainer,
    classNameOption,
    classNameSelectedOption,
}: CheckBoxObjectListAutoSizeCustomProps<T>) => {

    return (
        <CheckBoxObjectListAutoSize
            value={value}
            options={options}
            onChange={onChange}
            labelKey={labelKey}
            valueKey={valueKey}
            classNameContainer={clsx(StylesModule.container, classNameContainer)}
            classNameOption={clsx(StylesModule.option, classNameOption)}
            classNameSelectedOption={clsx(StylesModule.selectedOption, classNameSelectedOption)}
            classNameInputOption={StylesModule.inputCheckbox}
            renderLabel={renderLabel}
        />
    )
}

export default CheckBoxObjectListAutoSizeCustom;
