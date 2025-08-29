import type { StringKeys } from "./types";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./types";
import style from "./MultiSelectSearchCheck.module.css";
import { useClickOutside } from "../../../../customHooks/useClickOutside";


interface SingleProps<T> {
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
    selected: T | null;
    setSelected: (selected: T | null) => void;
}

export function SingleSelectSearchCheck<T>(props: SingleProps<T>) {
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

    // Selected como array para reutilizar lógica
    const selectedArray = selected != null ? [selected] : [];

    const onClickAddItem = (item: T) => {
        const isSelected = selected != null && selected[rowId] === item[rowId];
        if (isSelected) {
            setSelected(null);
            setSearch("");
        } else {
            setSelected(item);
            setSearch(item[rowId] as unknown as string);
            setOpen(false);
        }
    };

    const filteredItems = list.filter(
        (item) => !selectedArray.some((s) => s[rowId] === item[rowId])
    );

    useClickOutside([refButton, refDropDown], () => {
        setOpen(false);
        if (selected != null) {
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
                        <div className={`${classNameDropDownSelect ?? ""} ${style.dropDownSelect}`}>
                            {labelSelect &&
                                <div className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}>
                                    <span>
                                        {labelSelect}: {selectedArray.length}
                                    </span>
                                </div>
                            }
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
                                        <label htmlFor={`selected-${value}`}>{value}</label>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={`${classNameSeparator ?? ""} ${style.separator}`}></div>

                    <div className={`${classNameDropDownSearch ?? ""} ${style.dropDownSearch}`}>
                        {selectedArray.length > 0 && (
                            labelSearch &&
                            <div className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}>
                                <span>
                                    {labelSearch}: {filteredItems.length}
                                </span>
                            </div>
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


/*


    ¿Cómo se usa?

        1. Local:
        
            <SingleSelectSearchCheck
                rowId="id"
                search={search}
                setSearch={setSearch}
                open={open}
                setOpen={setOpen}
                emptyMessage="No encontrado"
                options={myLocalArray}      // <---- AQUÍ
                selected={selected}
                setSelected={setSelected}
            />

        2. Remoto/async:

            <SingleSelectSearchCheck
                rowId="id"
                search={search}
                setSearch={setSearch}
                open={open}
                setOpen={setOpen}
                emptyMessage="No encontrado"
                loadOptions={miFuncionAsyncDeBusqueda} // <---- AQUÍ
                selected={selected}
                setSelected={setSelected}
            />


    No les pases ambos a la vez.

        Si solo le pasas options, filtra local.

        Si solo le pasas loadOptions, hace fetch.


*/