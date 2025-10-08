import { memo } from "react";
import NumericInput from "../base/NumericInput";
import styleModule from "./NumericInputCustom.module.css";

interface NumericInputCustomProps {
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
    onlyCommitOnBlur?: boolean;
    classNameContainer?: string;
    classNameInput?: string;
    max?: number;
}

const NumericInputCustom = ({
    value,
    onChange,
    min,
    onlyCommitOnBlur,
    classNameContainer,
    classNameInput,
    max
}: NumericInputCustomProps) => {
    return (
        <NumericInput
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            onlyCommitOnBlur={onlyCommitOnBlur}
            className={`${classNameContainer} ${styleModule.container}`}
            classNameInput={`${classNameInput} nunito-semibold ${styleModule.input}`}
        />
    );
}

const NumericInputCustomMemo = memo(NumericInputCustom) as typeof NumericInputCustom;

export default NumericInputCustomMemo;
