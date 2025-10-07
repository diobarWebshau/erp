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

// Memoizamos
// Usamos `as typeof NumericInputCustom` para mantener el tipado intacto, especialmente si este componente es genérico o se usa en celdas de tablas
export default memo(NumericInputCustom) as typeof NumericInputCustom;
