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
    withValidation?: boolean;
}

const ObjectSelectCustom = <T,>({
    value,
    options,
    labelKey,
    onChange,
    placeholder = "Selecciona una opción",
    disabled = false,
    initialOpen,
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
            mainColor={disabled ? "var(--color-theme-neutral-primary)" : "var(--color-theme-primary)"}
            initialOpen={initialOpen}
            withValidation={withValidation}
            classNameOption={StyleModule.option}
            classNameOptionSelected={StyleModule.selected}
            classNamePopoverFloating={StyleModule.popoverFloating}
            classNameTrigger={StyleModule.trigger}
            classNameTriggerInvalid={StyleModule.triggerInvalid}
            classNameTriggerDisabled={StyleModule.disabled}
        />
    )
}

const ObjectSelectCustomMemo = memo(ObjectSelectCustom) as typeof ObjectSelectCustom;

export default ObjectSelectCustomMemo;
