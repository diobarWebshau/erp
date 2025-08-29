import React, { useRef, useState, useEffect } from "react";
import { useClickOutside } from "../../../customHooks/useClickOutside";
import style from "./SelectSearchMultiCheck.module.css";
import { Search } from "lucide-react";

type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

interface PropsCommon<T> {
    rowId: StringKeys<T>;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    emptyMessage: string;
    labelSelect: string;
    labelSearch: string;
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
}

interface PropsMulti<T> extends PropsCommon<T> {
    multiSelect: true;
    selected: T[];
    setSelected: (selected: T[]) => void;
}

interface PropsSingle<T> extends PropsCommon<T> {
    multiSelect?: false;
    selected: T | null;
    setSelected: (selected: T | null) => void;
}

type Props<T> = PropsMulti<T> | PropsSingle<T>;

function isMultiSelect<T>(props: Props<T>): props is PropsMulti<T> {
    return props.multiSelect === true;
}

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

function SelectSearchMultipleCheck<T>(props: Props<T>) {
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
        multiSelect = false,
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

    // Debounce la búsqueda para evitar llamadas excesivas
    const debouncedSearch = useDebounce(search, 300);

    // Carga async cuando se abre el dropdown o cambia la búsqueda
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

    function getSelectedArray<T>(props: Props<T>): T[] {
        if (isMultiSelect(props)) {
            // Aquí props.selected es T[]
            return props.selected ?? [];
        } else {
            // Aquí props.selected es T | null
            return props.selected != null ? [props.selected] : [];
        }
    }

    // Selected siempre como array para facilitar filtros y lógica interna
    const selectedArray = getSelectedArray(props);

    // Toggle selección o selección simple
    const onClickAddItem = (item: T) => {
        if (isMultiSelect(props)) {
            // Aquí TS sabe que setSelected es (selected: T[]) => void
            const isSelected = props.selected.some((i) => i[rowId] === item[rowId]);
            if (isSelected) {
                props.setSelected(props.selected.filter((i) => i[rowId] !== item[rowId]));
            } else {
                props.setSelected([...props.selected, item]);
            }
        } else {
            // Aquí TS sabe que setSelected es (selected: T | null) => void
            const isSelected = props.selected != null && props.selected[rowId] === item[rowId];
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


    // Filtrar para mostrar solo los que NO están seleccionados
    const filteredItems = list.filter(
        (item) => !selectedArray.some((s) => s[rowId] === item[rowId])
    );

    // Cerrar dropdown con click fuera
useClickOutside([refButton, refDropDown], () => {
  setOpen(false);

  if (!isMultiSelect(props) && selected != null && !Array.isArray(selected)) {
    // Ahora selected es T
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
                    {selectedArray.length > 0 && (
                        <div
                            className={`${classNameDropDownSelect ?? ""} ${style.dropDownSelect}`}
                        >
                            <div
                                className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}
                            >
                                <span>
                                    {labelSelect}: {selectedArray.length}
                                </span>
                            </div>
                            {selectedArray.map((item) => {
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

                    <div
                        className={`${classNameDropDownSearch ?? ""} ${style.dropDownSearch}`}
                    >
                        {selectedArray.length > 0 && (
                            <div
                                className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}
                            >
                                <span>
                                    {labelSearch}: {filteredItems.length}
                                </span>
                            </div>
                        )}

                        {isLoading ? (
                            <div
                                className={`${classNameLoading ?? ""} ${style.loading}`}
                                aria-live="polite"
                            >
                                Cargando...
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div
                                className={`${classNameEmptyMessage ?? ""} ${style.loading}`}
                                aria-live="polite"
                            >
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

export default SelectSearchMultipleCheck;
