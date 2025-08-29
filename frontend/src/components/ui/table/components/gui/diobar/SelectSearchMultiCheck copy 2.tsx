import { useRef } from 'react';
import { useClickOutside } from '../../../customHooks/useClickOutside';
import style from './SelectSearchMultiCheck.module.css';
import { Search } from "lucide-react";

type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never
}[keyof T];

interface PropsCommon<T> {
    list: T[];
    rowId: StringKeys<T>;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    isLoading: boolean;
    emptyMessage: string;
    labelSelect: string;
    labelSearch: string;
    icon?: React.ReactNode;
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

interface PropsMulti<T> extends PropsCommon<T> {
    multiSelect: true;
    selected: T[];
    setSelected: (selected: T[]) => void;
}

interface PropsSingle<T> extends PropsCommon<T> {
    multiSelect?: false;
    selected: T | null;
    setSelected: (selected: T | null) => void | null;
}

type Props<T> = PropsMulti<T> | PropsSingle<T>;

// Type guard para distinguir props multiSelect o single
function isMultiSelect<T>(props: Props<T>): props is PropsMulti<T> {
    return props.multiSelect === true;
}

function SelectSearchMultipleCheck<T>(props: Props<T>) {
    const {
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
        multiSelect = false,
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
    } = props;


    const refButton = useRef<HTMLButtonElement>(null);
    const refDropDown = useRef<HTMLDivElement>(null);

    let selectedArray: T[];

    if (isMultiSelect(props)) {
        selectedArray = props.selected;
    } else if (props.selected != null) {
        selectedArray = [props.selected];
    } else {
        selectedArray = [];
    }


    const onClickAddItem = (item: T) => {
        const isSelected = selectedArray.some(
            (item2) => item2[rowId] === item[rowId]
        );

        if (isMultiSelect(props)) {
            if (isSelected) {
                props.setSelected(
                    selectedArray.filter((item2) => item2[rowId] !== item[rowId])
                );
            } else {
                props.setSelected([...selectedArray, item]);
            }
        } else {
            if (isSelected) {
                props.setSelected(null);
                setSearch("");
            } else {
                props.setSelected(item);
                setSearch(item[rowId] as unknown as string);
                setOpen(false);
            }
        }
    };

    const getFilteredItems = (): T[] => {
        const lowerSearch = search.toLowerCase();

        return list.filter(item =>
            // Excluir los ya seleccionados
            !selectedArray.some(s => s[rowId] === item[rowId]) &&

            // Filtrar por búsqueda: verifica que la propiedad rowId contenga el texto search
            (item[rowId] as unknown as string).toLowerCase().includes(lowerSearch)
        );
    };


    // const getFilteredItems = (): T[] =>
    //     list.filter(
    //         (item) => !selectedArray.some((s) => s[rowId] === item[rowId])
    //     );

    function isSingleSelected<T>(selected: T[] | T | null): selected is T {
        return selected != null && !Array.isArray(selected);
    }


    useClickOutside(
        [refButton, refDropDown],
        () => {
            setOpen(false);
            if (!isMultiSelect(props) && isSingleSelected(selected)) {
                const key = rowId as keyof T;
                const value = selected[key];
                if (typeof value === "string") {
                    setSearch(value);
                } else if (value != null) {
                    setSearch(String(value));
                } else {
                    setSearch("");
                }
            }
        }
    );




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
                    />
                    {icon && (
                        <button
                            ref={refButton}
                            className={`${classNameButtonInput ?? ""} ${style.buttonIconInput}`}
                            onClick={() => setOpen(!open)}
                            type="button"
                            aria-label="Toggle dropdown"
                        >
                            {icon}
                        </button>
                    )}
                </div>
            </div>
            {open && (
                <div ref={refDropDown} className={`${classNameDropDown ?? ""} ${style.dropDown}`}>
                    {selectedArray.length > 0 && (
                        <div className={`${classNameDropDownSelect ?? ""} ${style.dropDownSelect}`}>
                            {
                                <div className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}>
                                    <span>{`${labelSelect}: ${selectedArray.length}`}</span>
                                </div>
                            }
                            {
                                selectedArray.map((item) => {
                                    const value = item[rowId] as unknown as string;
                                    return (
                                        <div
                                            className={`${classNameDropDownSelectItemSelected ?? ""} ${style.dropDownSelectItemSelected}`}
                                            key={value}
                                            onClick={() => onClickAddItem(item)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClickAddItem(item) }}
                                        >
                                            <input
                                                id={value}
                                                type="checkbox"
                                                checked
                                                readOnly
                                                className={classNameDropDownSelectItemInput}
                                                tabIndex={-1}
                                            />
                                            <label htmlFor={value}>{value}</label>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )}
                    <div className={`${classNameSeparator ?? ""} ${style.separator}`}></div>
                    <div className={`${classNameDropDownSearch ?? ""} ${style.dropDownSearch}`}>
                        {selectedArray.length > 0 && (
                            <div className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}>
                                <span>{`${labelSearch}: ${getFilteredItems().length}`}</span>
                            </div>
                        )}
                        {isLoading ? (
                            <div className={`${classNameLoading ?? ""} ${style.loading}`}>
                                Cargando...
                            </div>
                        ) : (getFilteredItems().length === 0 && !multiSelect) ? (
                            <div className={`${classNameEmptyMessage ?? ""} ${style.loading}`}>
                                {emptyMessage}
                            </div>
                        ) : (
                            getFilteredItems().map((item) => {
                                const value = item[rowId] as unknown as string;
                                return (
                                    <div
                                        className={`${classNameDropDownSearchItem ?? ""} ${style.dropDownSearchItem}`}
                                        key={value}
                                        onClick={() => onClickAddItem(item)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClickAddItem(item) }}
                                    >
                                        <input
                                            id={value}
                                            type="checkbox"
                                            readOnly
                                            className={classNameDropDownSelectItemInput}
                                            tabIndex={-1}
                                        />
                                        <label htmlFor={value}>{value}</label>
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

export default SelectSearchMultipleCheck;
