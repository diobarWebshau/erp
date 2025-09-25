import NumericInput from "../base/NumericInput";
import styleModule from "./NumericInputCustom.module.css";

interface NumericInputCustomProps {
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
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
    classNameInput
}: NumericInputCustomProps) => {
    return (
        <NumericInput
            value={value}
            onChange={onChange}
            min={min}
            onlyCommitOnBlur={onlyCommitOnBlur}
            className={`${classNameContainer} ${styleModule.container}`}
            classNameInput={`${classNameInput} nunito-semibold ${styleModule.input}`}
        />
    );
}

export default NumericInputCustom;
