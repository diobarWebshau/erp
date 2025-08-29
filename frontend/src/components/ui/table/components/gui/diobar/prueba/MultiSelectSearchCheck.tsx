import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce, type StringKeys } from "./types";
import style from "./MultiSelectSearchCheck.module.css";
import { useClickOutside } from "../../../../customHooks/useClickOutside";

interface MultiProps<T> {
    rowId: StringKeys<T>;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    emptyMessage: string;
    labelSelect?: string;
    labelSearch?: string;
    icon?: React.ReactNode;
    placeholder?: string;

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
    classNameDropDownHeader?: string;

    loadOptions: (inputValue: string) => Promise<T[]>;
    selected: T[];
    setSelected: (selected: T[]) => void;
}

export function MultiSelectSearchCheck<T>(props: MultiProps<T>) {
    const {
        rowId,
        selected,
        setSelected,
        search,
        setSearch,
        open,
        setOpen,
        emptyMessage,
        labelSelect,
        labelSearch,
        icon = <Search size={16} />,
        placeholder = "Buscar...",
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
        classNameDropDownHeader,
        loadOptions,
    } = props;

    const refButton = useRef<HTMLButtonElement>(null);
    const refDropDown = useRef<HTMLDivElement>(null);

    const [list, setList] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (!open) {
            setList([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        loadOptions(debouncedSearch)
            .then((res) => setList(res))
            .catch(() => setList([]))
            .finally(() => setIsLoading(false));
    }, [debouncedSearch, loadOptions, open]);

    const onClickAddItem = (item: T) => {
        const isSelected = selected.some((i) => i[rowId] === item[rowId]);
        if (isSelected) {
            setSelected(selected.filter((i) => i[rowId] !== item[rowId]));
        } else {
            setSelected([...selected, item]);
        }
    };

    const filteredItems = list.filter(
        (item) => !selected.some((s) => s[rowId] === item[rowId])
    );

    useClickOutside([refButton, refDropDown], () => {
        if (selected.length === 0) {
            setOpen(false);
        }
    });

    return (
        <div className={`${classNameContainer ?? ""} ${style.container}`}>
            <div>
                <div className={`${classNameInputContainer ?? ""} ${style.inputContainer}`}>
                    <input
                        className={`${classNameInput ?? ""} ${style.input}`}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                        onFocus={() => setOpen(true)}
                        aria-label="Buscar"
                    />
                    <button
                        ref={refButton}
                        className={`${classNameButtonInput ?? ""} ${style.buttonIconInput}`}
                        onClick={() => setOpen(!open)}
                        type="button"
                        aria-label="Toggle dropdown"
                    >
                        {icon}
                    </button>
                </div>
            </div>

            {open && (
                <div
                    ref={refDropDown}
                    className={`${classNameDropDown ?? ""} ${style.dropDown}`}
                    role="listbox"
                >
                    {selected.length > 0 && (
                        <div className={`${classNameDropDownSelect ?? ""} ${style.dropDownSelect}`}>
                            {labelSelect && (
                                <div className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}>
                                    <span>
                                        {labelSelect}: {selected.length}
                                    </span>
                                </div>
                            )}
                            {selected.map((item) => {
                                const value = item[rowId] as unknown as string;
                                return (
                                    <div
                                        key={value}
                                        className={`${classNameDropDownSelectItemSelected ?? ""} ${style.dropDownSelectItemSelected}`}
                                        onClick={() => onClickAddItem(item)}
                                        role="option"
                                        aria-selected="true"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") onClickAddItem(item);
                                        }}
                                    >
                                        <input
                                            id={`selected-${value}`}
                                            type="checkbox"
                                            checked
                                            readOnly
                                            className={classNameDropDownSelectItemInput}
                                            tabIndex={-1}
                                        />
                                        <label htmlFor={`selected-${value}`}>{value}</label>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={`${classNameSeparator ?? ""} ${style.separator}`}></div>

                    <div className={`${classNameDropDownSearch ?? ""} ${style.dropDownSearch}`}>
                        { filteredItems.length > 0 && (
                            labelSearch && (
                                <div className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}>
                                    <span>
                                        {labelSearch}: {filteredItems.length}
                                    </span>
                                </div>
                            )
                        )}

                        {isLoading ? (
                            <div className={`${classNameLoading ?? ""} ${style.loading}`} aria-live="polite">
                                Cargando...
                            </div>
                        ) : search.trim() === "" ? (
                            null
                        ) : filteredItems.length === 0 ? (
                            <div className={`${classNameEmptyMessage ?? ""} ${style.loading}`} aria-live="polite">
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredItems.map((item) => {
                                const value = item[rowId] as unknown as string;
                                return (
                                    <div
                                        key={value}
                                        className={`${classNameDropDownSearchItem ?? ""} ${style.dropDownSearchItem}`}
                                        onClick={() => onClickAddItem(item)}
                                        role="option"
                                        aria-selected="false"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") onClickAddItem(item);
                                        }}
                                    >
                                        <input
                                            id={`option-${value}`}
                                            type="checkbox"
                                            readOnly
                                            className={classNameDropDownSelectItemInput}
                                            tabIndex={-1}
                                        />
                                        <label htmlFor={`option-${value}`}>{value}</label>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
