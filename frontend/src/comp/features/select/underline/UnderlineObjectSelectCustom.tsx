import { memo } from "react";
import StyleModule from "./UnderlineObjectSelectCustom.module.css";
import ObjectSelectMemo from "./UnderlineObjectSelect";

interface IUnderlineObjectSelectCustom<T> {
    value: T | null;
    options: T[];
    labelKey: keyof T;
    onChange: (value: T | null) => void;
    label: string;
    disabled?: boolean;
    initialOpen?: boolean;
    withValidation?: boolean;
    maxHeight?: string;
}

const UnderlineObjectSelectCustom = <T,>({
    value,
    options,
    labelKey,
    onChange,
    label,
    disabled = false,
    initialOpen,
    withValidation = false,
    maxHeight
}: IUnderlineObjectSelectCustom<T>) => {
    return (
        <ObjectSelectMemo
            value={value}
            options={options}
            labelKey={labelKey}
            onChange={onChange}
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
            selectedLabelClassName={StyleModule.selectedLabel}
            maxHeight={maxHeight}
            label={label}
        />
    )
}

const UnderlineObjectSelectCustomMemo = memo(UnderlineObjectSelectCustom) as typeof UnderlineObjectSelectCustom;

export default UnderlineObjectSelectCustomMemo;
