import { memo } from "react";
import StyleModule from "./StandardSelectCustom.module.css";
import StandardSelectMemo from "./StandardSelect";

interface IStandardSelectCustom<T extends string> {
    value: T;
    options: T[];
    onChange: (value: T) => void;
    placeholder?: string;
    disabled?: boolean;
    initialOpen?: boolean;
    mainColor: string;
    withValidation?: boolean;
}

const StandardSelectCustom = <T extends string>({
    value,
    options,
    onChange,
    placeholder = "Selecciona una opción",
    disabled,
    initialOpen,
    mainColor,
    withValidation = false,
}: IStandardSelectCustom<T>) => {
    return (
        <StandardSelectMemo
            value={value}
            options={options}
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

const StandardSelectCustomMemo = memo(StandardSelectCustom) as typeof StandardSelectCustom;

export default StandardSelectCustomMemo;
