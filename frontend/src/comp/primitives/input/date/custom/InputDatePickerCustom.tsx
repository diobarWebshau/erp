import { Calendar } from "lucide-react";
import ReactDayPickerField from "../base/ReactDayPickerField";
import StyleModule from "./InputDatePickerCustom.module.css";

interface ReactDayPickerFieldProps {
    label?: string;
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    classNameContainer?: string;
    classNameInput?: string;
}

const InputDatePickerCustom = ({
    label,
    value,
    onChange,
    classNameContainer,
    classNameInput
}: ReactDayPickerFieldProps) => {

    return (
        <ReactDayPickerField
            icon={<Calendar className={StyleModule.iconDayPickerField} />}
            value={value}
            {...label && { label }}
            onChange={onChange}
            classNameContainer={classNameContainer ?? StyleModule.containerMainDayPickerFieldDeliver}
            classNameField={classNameInput ?? StyleModule.containerFieldDayPickerFieldDeliver}
            classNameLabel={StyleModule.labelDayPickerFieldDeliver}
            classNameButton={StyleModule.buttonDayPickerFieldDeliver}
            classNameDayPicker={`nunito-semibold ${StyleModule.dayPicker}`}
            classNamePopover={StyleModule.containerPopoverDayPickerField}
        />
    );
}

export default InputDatePickerCustom;
