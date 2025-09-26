import { type ChangeEvent } from "react"
import styles from "./CheckBoxListAutoSize.module.css"
interface CheckBoxListAutoSizeProps {
    value: string[]
    options: string[]
    onChange: (selected: string[]) => void
    classNameContainer?: string
    classNameGroupOptions?: string,
    classNameOption?: string,
    classNameSelectedOption?: string,
    classNameInputOption?: string,
}

const CheckBoxListAutoSize = ({
    value,
    options,
    onChange,
    classNameContainer = "",
    classNameGroupOptions = "",
    classNameOption = "",
    classNameSelectedOption = "",
    classNameInputOption = "",
}: CheckBoxListAutoSizeProps) => {

    const selectedOptions = Array.isArray(value) ? value : [];

    const handleToggle = (e: ChangeEvent<HTMLInputElement>, option: string) => {
        const checked = e.target.checked;
        const updated = checked
            ? [...selectedOptions, option]
            : selectedOptions.filter((item) => item !== option);

        onChange?.(updated);
    };


    return (
        <div
            className={`${styles.groupOptions} ${classNameContainer}`}
        >
            {options.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                    <label
                        htmlFor={option}
                        key={option}
                        className={
                            `${styles.option} ${classNameOption} ` +
                            `${isSelected ? styles.selected : ""} ` +
                            `${isSelected ? classNameSelectedOption : ""}`
                        }
                    >
                        <input
                            id={option}
                            type="checkbox"
                            className={`${styles.inputCheckbox} ${classNameInputOption}`}
                            checked={isSelected}
                            onChange={(e) => handleToggle(e, option)}
                        />
                        {option}
                    </label>
                )
            })}
        </div>
    )
}

export default CheckBoxListAutoSize
