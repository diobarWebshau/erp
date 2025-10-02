import { useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import styles from "./CheckBoxWithSearch.module.css"
import type { ColumnTypeDataFilter } from "../../../../../../interfaces/tableTypes"
import InputTextCustom from "../../../../input/text/custom/InputTextCustom"
import { Search } from "lucide-react"

interface CheckBoxWithSearchProps {
    value: ColumnTypeDataFilter
    options: string[]
    onChange: (selected: ColumnTypeDataFilter) => void
    classNameContainer?: string
    classNameGroupOptions?: string,
    classNameOption?: string,
    classNameSelectedOption?: string,
    classNameInputOption?: string,
    classNameContainerSearch?: string
    classNameInputSearch?: string
    classNameButtonSearch?: string
}

const CheckBoxWithSearch = ({
    value,
    options,
    onChange,
    classNameContainer = "",
    classNameGroupOptions = "",
    classNameOption = "",
    classNameSelectedOption = "",
    classNameInputOption = "",
    classNameContainerSearch = "",
    classNameInputSearch = "",
    classNameButtonSearch = "",
}: CheckBoxWithSearchProps) => {

    const selectedOptions = Array.isArray(value) ? value : [];

    const [searchQuery, setSearchQuery] = useState("")

    const onChangeSearchInput = (value: string) => {
        setSearchQuery(value)
    }

    const handleToggle = (e: ChangeEvent<HTMLInputElement>, option: string) => {
        const checked = e.target.checked;
        const updated = checked
            ? [...selectedOptions, option]
            : selectedOptions.filter((item) => item !== option);

        onChange?.(updated as ColumnTypeDataFilter);
    };

    const filteredOptions = useMemo(() => {
        return options.filter(
            (option) =>
                option.toLowerCase()
                    .includes(searchQuery.toLowerCase())
        )
    }, [options, searchQuery])

    return (
        <div
            className={`${styles.container} ${classNameContainer}`}
        >
            <InputTextCustom
                value={searchQuery}
                placeholder="Search"
                onChange={onChangeSearchInput}
                classNameContainer={`${styles.containerInputTextCustom} ${classNameContainerSearch}`}
                classNameInput={`${styles.inputCheckbox} ${classNameInputSearch}`}
                classNameButton={`${styles.buttonInputTextCustom} ${classNameButtonSearch}`}
                icon={<Search />}
            />
            <div className={`${classNameGroupOptions} ${styles.groupOptions}`}>
                {filteredOptions.map((option) => {
                    const isSelected = selectedOptions.includes(option);
                    return (
                        <label
                            htmlFor={option}
                            key={option}
                            className={
                                `nunito-semibold ` +
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
        </div>
    )
}

export default CheckBoxWithSearch
