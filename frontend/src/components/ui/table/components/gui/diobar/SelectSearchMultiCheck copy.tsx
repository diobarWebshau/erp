import style
    from './SelectSearchMultiCheck.module.css';
import {
    Search
} from "lucide-react";

type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never
}[keyof T];

interface Props<T> {
    list: T[];
    selected: T[];
    rowId: StringKeys<T>;
    setSelected: (selected: T[]) => void;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    isLoading: boolean;
    emptyMessage: string;
    labelSelect: string;
    labelSearch: string;
    icon?: React.ReactNode;
    multiSelect?: boolean;
    classNameContainer?: string;
    classNameDropDown?: string;
    classNameInputContainer?: string;
    classNameInput?: string;
    classNameButtonInput?: string;
    classNameDropDownSelect?: string;
    classNameDropDownSearch?: string;
    classNameDropDownSelectItemSelected?: string;
    classNameDropDownSearchItem?: string;
    classNameSeparator?: string;
    classNameDropDownSelectItemInput?: string;
    classNameLoading?: string;
    classNameEmptyMessage?: string;
    placeholder?: string;
    classNameDropDownHeader?: string;
}

const SelectSearchMultipleCheck = <T,>({
    list,
    selected,
    rowId,
    setSelected,
    search,
    setSearch,
    open,
    setOpen,
    isLoading,
    emptyMessage,
    labelSelect,
    labelSearch,
    icon,
    multiSelect = true,
    classNameContainer,
    classNameDropDown,
    classNameInputContainer,
    classNameInput,
    classNameButtonInput,
    classNameDropDownSelect,
    classNameDropDownSearch,
    classNameDropDownSelectItemSelected,
    classNameDropDownSearchItem,
    classNameSeparator,
    classNameDropDownSelectItemInput,
    classNameLoading,
    classNameEmptyMessage,
    placeholder,
    classNameDropDownHeader
}: Props<T>) => {

    const onClickAddItem = (item: T) => {
        const isSelected = selected.findIndex(
            (item2) =>
                item2[rowId] === item[rowId]) !== -1;

        if (multiSelect) {
            if (isSelected) {
                setSelected(selected.filter(
                    (item2) =>
                        item2[rowId] !== item[rowId]));
            } else {
                setSelected([...selected, item]);
            }
        } else {
            if (isSelected) {
                setSelected([]);
                setSearch("");
            } else {
                setSelected([item]);
                setSearch(item[rowId] as string);
                setOpen(false);
            }
        }
    };


    const getFilteredItems = (): T[] => {
        return list
            .filter(item =>
                !selected.some(s =>
                    s[rowId] === item[rowId]
                )
            )
    };

    return (
        <div className={`${classNameContainer} ${style.container}`}>
            <div>
                <div className={
                    `${classNameInputContainer} `
                    + `${style.inputContainer}`
                }>
                    <input
                        className={`${classNameInput} ${style.input}`}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                    />
                    {icon && (
                        <button
                            className={
                                `${classNameButtonInput} ` +
                                `${style.buttonIconInput}`
                            }
                            onClick={() => setOpen(!open)}
                            type="button"
                        >
                            {icon}
                        </button>
                    )}
                </div>
            </div>
            {open && (
                <div className={
                    `${classNameDropDown} `
                    + `${style.dropDown}`
                }>
                    {selected.length > 0 && (
                        <div className={
                            `${classNameDropDownSelect} `
                            + `${style.dropDownSelect}`
                        }>
                            <div className={` ${classNameDropDownHeader} ${style.dropDownhHeader}`}>
                                <span>
                                    {`${labelSelect}: ${selected.length}`}
                                </span>
                            </div>
                            {
                                selected.map((item) => {
                                    const value = item[rowId] as string;
                                    return (
                                        <div
                                            className={
                                                `${classNameDropDownSelectItemSelected} `
                                                + `${style.dropDownSelectItemSelected}`
                                            }
                                            key={value}
                                            onClick={() => onClickAddItem(item)}
                                        >
                                            <input
                                                id={value}
                                                type="checkbox"
                                                checked
                                                readOnly
                                                className={classNameDropDownSelectItemInput}
                                            />
                                            <label htmlFor={value}>{value}</label>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )}
                    <div
                        className={
                            `${classNameSeparator} `
                            + `${style.separator}`
                        }
                    ></div>
                    <div className={
                        `${classNameDropDownSearch} `
                        + `${style.dropDownSearch}`
                    }>
                        {selected.length > 0 && (
                            <div className={`${classNameDropDownHeader} ${style.dropDownhHeader}`}>
                                <span>
                                    {`${labelSearch}: ${getFilteredItems().length}`}
                                </span>
                            </div>
                        )}
                        {isLoading ? (
                            <div className={
                                `${classNameLoading} `
                                + `${style.loading}`
                            }>Cargando...</div>
                        ) : (
                            getFilteredItems().length === 0 ? (
                                <div className={
                                    `${classNameEmptyMessage} `
                                    + `${style.loading}`
                                }>{emptyMessage}</div>
                            ) : (
                                getFilteredItems().map((item) => {
                                    const value = item[rowId] as string;
                                    return (
                                        <div
                                            className={
                                                `${classNameDropDownSearchItem} `
                                                + `${style.dropDownSearchItem}`
                                            }
                                            key={value}
                                            onClick={() => onClickAddItem(item)}
                                        >
                                            <input
                                                id={value}
                                                type="checkbox"
                                                readOnly
                                                className={classNameDropDownSelectItemInput}
                                            />
                                            <label
                                                htmlFor={value}>
                                                {value}
                                            </label>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SelectSearchMultipleCheck;
