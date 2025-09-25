import { ChevronDown } from "lucide-react";
import type { BaseRow } from "../../../../../interfaces/globalTypes";
import ObjectSelect from "../base/ObjectSelect";
import StyleModule from "./ObjectSelectCustom.module.css";

interface ObjectSelectCustomProps<T extends BaseRow> {
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


const ObjectSelectCustom = <T extends BaseRow>({
    options,
    labelKey,
    defaultLabel = "Selecciona una opción",
    autoOpen = true,
    onChange,
    value,
    classNameFieldContainer,
    classNameToggleContainer,
    classNameOption
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

export default ObjectSelectCustom