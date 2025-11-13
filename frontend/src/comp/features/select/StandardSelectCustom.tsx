import { memo } from "react";
import StyleModule from "./StandardSelectCustom.module.css";
import StandardSelectMemo from "./StandardSelect";

interface IStandardSelectCustom<T extends string> {
    value: T | null;
    options: T[];
    onChange: (value: T | null) => void;
    placeholder?: string;
    disabled?: boolean;
    initialOpen?: boolean;
    withValidation?: boolean;
    maxHeight?: string;
}

const StandardSelectCustom = <T extends string>({
    value,
    options,
    onChange,
    placeholder = "Selecciona una opción",
    disabled = false,
    initialOpen,
    withValidation = false,
    maxHeight,
}: IStandardSelectCustom<T>) => {
    return (
        <StandardSelectMemo
            value={value}
            options={options}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            mainColor={disabled ? "var(--color-theme-neutral-primary)" : "var(--color-theme-primary)"}
            initialOpen={initialOpen}
            withValidation={withValidation}
            classNameOption={`nunito-regular ${StyleModule.option}`}
            classNameOptionSelected={StyleModule.selected}
            classNamePopoverFloating={StyleModule.popoverFloating}
            classNameTrigger={StyleModule.trigger}
            classNameTriggerInvalid={StyleModule.triggerInvalid}
            classNameTriggerDisabled={StyleModule.disabled}
            maxHeight={maxHeight}
        />
    )
}

const StandardSelectCustomMemo = memo(StandardSelectCustom) as typeof StandardSelectCustom;

export default StandardSelectCustomMemo;
