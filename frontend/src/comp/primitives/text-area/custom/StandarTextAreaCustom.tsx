import type { TextareaHTMLAttributes } from "react";
import StandardTextArea from "../base/StandarTextArea"
import StyleModule from "./StandarTextAreaCustom.module.css"

interface StandardTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    classNameContainer?: string;
    classNameTextArea?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    maxLength?: number;
}



const StandarTextAreaCustom = ({
    classNameContainer,
    classNameTextArea,
    value,
    onChange,
    placeholder = "comentarios (Opcional)",
    maxLength
}: StandardTextAreaProps) => {

    return (
        <StandardTextArea
            value={value}
            onChange={onChange}
            classNameContainer={`${StyleModule.containerTextArea} ${classNameContainer}`}
            classNameTextArea={`nunito-regular ${StyleModule.textArea} ${classNameTextArea}`}
            id="notes"
            placeholder={placeholder}
            maxLength={maxLength}
        />
    )
}


export default StandarTextAreaCustom
