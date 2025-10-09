import { memo } from "react";
import { ChevronDown } from "lucide-react";
import ObjectSelect from "../base/ObjectSelect";
import StyleModule from "./ObjectSelectCustom.module.css";

interface ObjectSelectCustomProps<T> {
    value?: T | null | undefined; // valor seleccionado desde el padre
    options: T[];
    labelKey: keyof T;
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: ((value: T | null | undefined) => void);
    classNameFieldContainer?: string;
    classNameToggleContainer?: string;
    classNameOption?: string;
}

const ObjectSelectCustom = <T,>({
    options,
    labelKey,
    defaultLabel = "Selecciona una opción",
    autoOpen = false,
    onChange,
    value,
    classNameFieldContainer,
    classNameToggleContainer,
    classNameOption,
}: ObjectSelectCustomProps<T>) => {

    return (
        <ObjectSelect
            options={options}
            labelKey={labelKey}
            defaultLabel={defaultLabel}
            autoOpen={autoOpen}
            onChange={onChange}
            value={value}
            icon={<ChevronDown className={StyleModule.iconButton} />}
            classNameFieldContainer={`${StyleModule.customSelectFieldContainer} ${classNameFieldContainer}`}
            classNameToggleContainer={`${StyleModule.customSelectToggleContainer} ${classNameToggleContainer}`}
            classNameOption={`${StyleModule.customSelectOption} ${classNameOption}`}
        />
    )
}

// Memoizamos el componente para optimizar renders dentro de tablas u otros escenarios donde se re-renderiza mucho
// Usamos `as typeof ObjectSelectCustom` para mantener el tipado genérico <T> que TypeScript pierde al usar memo()
export default memo(ObjectSelectCustom) as typeof ObjectSelectCustom;
