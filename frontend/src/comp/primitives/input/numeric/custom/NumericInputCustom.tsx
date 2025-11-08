import { memo } from "react";
import NumericInput from "../base/NumericInput";
import styleModule from "./NumericInputCustom.module.css";

interface NumericInputCustomProps {
    value: number | null;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    onlyCommitOnBlur?: boolean;
    classNameContainer?: string;
    classNameInput?: string;
}

const NumericInputCustom = ({
    value,
    onChange,
    min,
    onlyCommitOnBlur,
    classNameContainer,
    max,
    placeholder,
    classNameInput
}: NumericInputCustomProps) => {
    return (
        <NumericInput
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            onlyCommitOnBlur={onlyCommitOnBlur}
            classNameContainer={`${classNameContainer} ${styleModule.container} `}
            classNameInput={`${classNameInput} ${styleModule.input}`}
            classNameInputValid={styleModule.inputValid}
            classNameInputInvalid={styleModule.inputInvalid}
            classNameControls={styleModule.controls}
            classNameControlsIcon={styleModule.iconControl}
            {...(placeholder ? { placeholder } : {})}
        />
    );
}

const NumericInputCustomMemo = memo(NumericInputCustom) as typeof NumericInputCustom;

export default NumericInputCustomMemo;
