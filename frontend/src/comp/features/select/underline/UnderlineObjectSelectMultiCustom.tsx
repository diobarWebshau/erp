import { memo } from "react";
import StyleModule from "./UnderlineObjectSelectMultiCustom.module.css";
import ObjectSelectMultiMemo from "./UnderlineObjectSelectMulti";

interface IObjectSelectMultiCustom<T> {
    value: T[] | [];
    options: T[];
    labelKey: keyof T;
    onChange: (value: T[]) => void;
    label: string;
    disabled?: boolean;
    initialOpen?: boolean;
    withValidation?: boolean;
    maxHeight?: string;
}

const ObjectSelectMultiCustom = <T,>({
    value,
    options,
    labelKey,
    onChange,
    label,
    disabled = false,
    initialOpen,
    withValidation = false,
    maxHeight
}: IObjectSelectMultiCustom<T>) => {
    return (
        <ObjectSelectMultiMemo
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

const ObjectSelectMultiCustomMemo = memo(ObjectSelectMultiCustom) as typeof ObjectSelectMultiCustom;

export default ObjectSelectMultiCustomMemo;
