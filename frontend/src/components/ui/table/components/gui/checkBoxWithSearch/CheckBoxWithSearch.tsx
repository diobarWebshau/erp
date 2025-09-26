import {
    useMemo,
    useState,
    type ChangeEvent
} from "react"
import styles
    from "./CheckBoxWithSearch.module.css"
import Input
    from "../input/input-text-search/input"
import type {
    ColumnTypeDataFilter
} from "../../../types"

interface CheckBoxWithSearchProps {
    value: ColumnTypeDataFilter
    options: string[]
    onChange?: (selected: ColumnTypeDataFilter) => void
    classNameContainer?: string
    classNameGroupOptions?: string,
    classNameOption?: string,
    classNameSelectedOption?: string,
    classNameInputOption?: string,
    classNameContainerSearch?: string
    classNameInputSearch?: string
    classNameButtonSearch?: string
    iconSearch?: React.ReactNode
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
    iconSearch,
}: CheckBoxWithSearchProps) => {

    const selectedOptions = Array.isArray(value) ? value : [];

    const [searchQuery, setSearchQuery] = useState("")

    const onChangeSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
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
        <div className={
            `${styles.checkboxContainer} ` +
            `${classNameContainer}`
        }>
            <Input
                placeholder="Search"
                type="text"
                onChange={onChangeSearchInput}
                classNameContainer={classNameContainerSearch}
                classNameInput={classNameInputSearch}
                classNameButton={classNameButtonSearch}
                icon={iconSearch}
            />
            <div className={`${classNameGroupOptions} ${styles.groupOptions}`}>
                {filteredOptions.map((option) => {
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
                                className={`${styles.input} ${classNameInputOption}`}
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
