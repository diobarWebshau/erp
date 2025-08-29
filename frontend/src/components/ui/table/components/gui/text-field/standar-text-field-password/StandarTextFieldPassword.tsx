import { useState } from "react";
import StyleModule
    from "./StandarTextFieldPassword.module.css";
import {
    EyeOff,
    Eye,
} from 'lucide-react'

interface StandarTextFieldProps {
    label: string,
    placeholder?: string,
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
    classNameEyeIcon?: string,
}

const StandarTextFieldPassword = ({
    label,
    placeholder,
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
    classNameEyeIcon
}: StandarTextFieldProps) => {


    const [isVisible, setIsVisible] = useState(false);

    const handleVisibility = () => {
        setIsVisible(!isVisible);
    }

    return (
        <div className={`${StyleModule.classNameContainer} ${classNameContainer}`}>
            <label htmlFor={id} className={`${StyleModule.classNameLabel} ${classNameLabel}`}>{label}</label>
            <div className={StyleModule.classNameInputContainer}>
                <input
                    id={id} 
                    name={name}
                    type={isVisible ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    defaultValue={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    autoFocus={autoFocus}
                    className={`${StyleModule.classNameInput} ${classNameInput}`}
                />
                <button
                    type="button"
                    onClick={handleVisibility}
                    className={StyleModule.classNameButton}
                >
                    { isVisible ? <Eye className={classNameEyeIcon}/> : <EyeOff className={classNameEyeIcon}/>}
                </button>
            </div>
        </div>
    );
};

export default StandarTextFieldPassword;