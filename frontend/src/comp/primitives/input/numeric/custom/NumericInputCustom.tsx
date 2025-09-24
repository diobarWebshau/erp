import NumericInput from "../base/NumericInput";
import styleModule from "./NumericInputCustom.module.css";

interface NumericInputCustomProps {
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
    onlyCommitOnBlur?: boolean;
}


const NumericInputCustom = ({
    value,
    onChange,
    min,
    onlyCommitOnBlur,
}: NumericInputCustomProps) => {
    return (
        <NumericInput
            value={value}
            onChange={onChange}
            min={min}
            onlyCommitOnBlur={onlyCommitOnBlur}
            className={styleModule.container}
            classNameInput={`nunito-semibold ${styleModule.input}`}
        />
    );
}

export default NumericInputCustom;
