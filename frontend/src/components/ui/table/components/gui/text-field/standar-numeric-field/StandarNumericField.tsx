import StyleModule
    from "./StandarNumericField.module.css";

interface StandarNumericFieldProps {
    label?: string,
    placeholder?: string,
    type?: string,
    value: number | string,
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

const StandarNumericField = ({
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
}: StandarNumericFieldProps) => {
    return (
        <div className={`${StyleModule.classNameContainer} ${classNameContainer}`}>
            <label
                htmlFor={id}
                className={`nunito-semibold ${StyleModule.classNameLabel} ${classNameLabel}`}
            >
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                autoFocus={autoFocus}
                className={`nunito-regular ${StyleModule.classNameInput} ${classNameInput}`}
            />
        </div>
    );
};

export default StandarNumericField;