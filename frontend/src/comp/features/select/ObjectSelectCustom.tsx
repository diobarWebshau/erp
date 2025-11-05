import { memo } from "react";
import ObjectSelect from "./ObjectSelect";
import StyleModule from "./ObjectSelectCustom.module.css";

interface IObjectSelectCustom<T> {
    value: T | null;
    options: T[];
    labelKey: keyof T;
    onChange: (value: T) => void;
    placeholder?: string;
    disabled?: boolean;
    initialOpen?: boolean;
    mainColor: string;
    withValidation?: boolean;
}

const ObjectSelectCustom = <T,>({
    value,
    options,
    labelKey,
    onChange,
    placeholder = "Selecciona una opción",
    disabled,
    initialOpen,
    mainColor,
    withValidation = false,
}: IObjectSelectCustom<T>) => {
    return (
        <ObjectSelect
            value={value}
            options={options}
            labelKey={labelKey}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            mainColor={mainColor}
            initialOpen={initialOpen}
            withValidation={withValidation}
            classNameOption={StyleModule.option}
            classNameOptionSelected={StyleModule.selected}
            classNamePopoverFloating={StyleModule.popoverFloating}
            classNameTrigger={StyleModule.trigger}
            classNameTriggerInvalid={StyleModule.triggerInvalid}

        />
    )
}

const ObjectSelectCustomMemo = memo(ObjectSelectCustom) as typeof ObjectSelectCustom;

export default ObjectSelectCustomMemo;
