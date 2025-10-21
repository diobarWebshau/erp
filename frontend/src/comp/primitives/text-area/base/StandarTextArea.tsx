import type { ReactNode, TextareaHTMLAttributes } from "react";
import StyleModule from "./StandarTextArea.module.css";

interface StandardTextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    help?: string;
    classNameContainer?: string;
    classNameLabel?: string;
    classNameTextArea?: string;
    classNameError?: string;
    classNameHelp?: string;
    ComponentLabel?: (props: { id: string }) => ReactNode;
}

const StandardTextArea = ({
    label,
    error,
    help,
    classNameContainer,
    classNameLabel,
    classNameTextArea,
    classNameError,
    classNameHelp,
    ComponentLabel,
    ...props
}: StandardTextAreaProps) => {

    return (
        <div className={`${StyleModule.container} ${classNameContainer}`}>
            {
                ComponentLabel ? (
                    ComponentLabel({ id: props.id ?? "" })
                ) : label ? (
                    <label className={classNameLabel} htmlFor={props.id ?? ""}>
                        {label}
                    </label>
                ) : null
            }
            <textarea
                className={`${classNameTextArea} ${StyleModule.textarea} ${error ? "textarea-error" : ""}`}
                aria-invalid={!!error}
                {...props}
            />
            {help && !error && (
                <small className={classNameHelp}>{help}</small>
            )}
            {error && (
                <div className={classNameError} style={{ color: "#d32f2f" }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default StandardTextArea;
