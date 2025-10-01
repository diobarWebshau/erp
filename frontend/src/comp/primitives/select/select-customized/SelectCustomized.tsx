import type { ChangeEvent, ReactElement } from "react";
import styleModule from "./SelectCustomized.module.css";
import { isValidElement, cloneElement } from "react"


interface InputSelectProps {
    options: string[];
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    defaultValue?: string;
    disabled?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    className?: string;
    icon?: React.ReactNode;
}



const Select = ({
    options,
    onChange,
    disabled,
    required,
    autoFocus,
    className,
    icon,
    defaultValue
}: InputSelectProps) => {

    const styledIcon = isValidElement(icon) && cloneElement(icon as ReactElement<any>, {
        className: styleModule.icon
    })

    return (
        <div className={`${styleModule.selectWrapper}`}>
            <select
                defaultValue={defaultValue}
                onChange={onChange}
                disabled={disabled}
                required={required}
                autoFocus={autoFocus}
                className={`${styleModule.select} ${className}`}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <button className={styleModule.containerIcon}>
                {styledIcon}
            </button>
            <button className={styleModule.achicanada}>
            </button>
        </div>
    )
}

export default Select;