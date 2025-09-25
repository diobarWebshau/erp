import { ChevronDown } from "lucide-react";
import StandarSelect from "../base/StandarSelect";
import StyleModule from "./StandarSelectCustom.module.css";

interface StandarSelectProps<T extends string> {
    value?: T;
    options: T[];
    defaultLabel?: string;
    autoOpen?: boolean;
    onChange?: (value: T) => void;
    classNameFieldContainer?: string;
    classNameOption?: string;
}

const StandarSelectCustom = <T extends string>({
    options,
    defaultLabel,
    autoOpen,
    onChange,
    value,
    classNameFieldContainer,
    classNameOption,
}: StandarSelectProps<T>) => {

    return (
        <StandarSelect
            options={options}
            defaultLabel={defaultLabel}
            autoOpen={autoOpen}
            onChange={onChange}
            value={value}
            icon={<ChevronDown className={StyleModule.iconButton} />}
            classNameFieldContainer={`${classNameFieldContainer} ${StyleModule.customSelectFieldContainer}`}
            classNameToggleContainer={StyleModule.customSelectToggleContainer}
            classNameOption={`${classNameOption} ${StyleModule.customSelectOption}`}
            classNameOptionSelected={StyleModule.customSelectOptionSelected}
        />
    );
};

export default StandarSelectCustom;
