import StyleModule
    from "./StandarTextField.module.css";

interface StandarTextFieldProps {
    label: string,
    placeholder?: string,
    type?: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    required?: boolean,
    disabled?: boolean,
    autoFocus?: boolean,
    classNameContainer?: string,
    classNameLabel?: string,
    classNameInput?: string,
    id?: string,
    name?: string,
    icon?: React.ReactNode
}

const StandarTextField = ({
    label,
    placeholder,
    type,
    value,
    onChange,
    required,
    disabled,
    autoFocus,
    classNameInput,
    classNameLabel,
    classNameContainer,
    id,
    name,
    icon
}: StandarTextFieldProps) => {
    return (
        <div className={`${StyleModule.classNameContainer} ${classNameContainer}`}>
            <label htmlFor={id} className={`${StyleModule.classNameLabel} ${classNameLabel}`}>{label}</label>
            <div className={StyleModule.classNameInputContainer}>
                <input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    defaultValue={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    autoFocus={autoFocus}
                    className={`${StyleModule.classNameInput} ${classNameInput}`}
                />
                {
                    icon && (
                        <button
                            type="button"
                            className={StyleModule.classNameButton}
                        >
                            {icon}
                        </button>
                    )
                }
            </div>
        </div>
    );
};

export default StandarTextField;