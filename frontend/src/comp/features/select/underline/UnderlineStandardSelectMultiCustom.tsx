import { memo } from "react";
import StyleModule from "./UnderlineStandardSelectMultiCustom.module.css";
import StandardSelectMultiMemo from "./UnderlineStandardSelectMulti";

interface IStandardSelectMultiCustom<T extends string> {
    value: T[];
    options: T[];
    onChange: (value: T[]) => void;
    placeholder?: string;
    disabled?: boolean;
    initialOpen?: boolean;
    withValidation?: boolean;
    maxHeight?: string;
    label: string;
}

const StandardSelectMultiCustom = <T extends string>({
    value,
    options,
    onChange,
    placeholder = "Selecciona una opción",
    disabled = false,
    initialOpen,
    withValidation = false,
    maxHeight,
    label
}: IStandardSelectMultiCustom<T>) => {
    return (
        <StandardSelectMultiMemo
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
            selectedLabelClassName={StyleModule.selectedLabel}
            maxHeight={maxHeight}
            label={label}
        />
    )
}

const StandardSelectMultiCustomMemo = memo(StandardSelectMultiCustom) as typeof StandardSelectMultiCustom;

export default StandardSelectMultiCustomMemo;
