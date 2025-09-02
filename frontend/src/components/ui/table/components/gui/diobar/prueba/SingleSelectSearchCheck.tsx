import type { StrictStringKeys } from "./types";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./types";
import style from "./MultiSelectSearchCheck.module.css";
import { useClickOutside } from "../../../../customHooks/useClickOutside";

interface SingleProps<T> {
    rowId: StrictStringKeys<T>;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    emptyMessage: string;
    labelSelect?: string;
    labelSearch?: string;
    icon?: React.ReactNode;
    placeholder?: string;

    options?: T[];                       // <--- LOCAL
    loadOptions?: (inputValue: string) => Promise<T[]>; // <--- REMOTO

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
    selected: T | null;
    setSelected: (selected: T | null) => void;
}

const SingleSelectSearchCheck = <T,>({
    rowId, selected, setSelected, search, setSearch,
    open, setOpen, emptyMessage, labelSelect, labelSearch,
    icon = <Search size={16} />, placeholder = "Buscar...",
    options, loadOptions,
    classNameContainer, classNameDropDown, classNameInputContainer, classNameInput, classNameButtonInput,
    classNameDropDownSelect, classNameDropDownSearch, classNameDropDownSelectItemSelected,
    classNameDropDownSearchItem, classNameSeparator, classNameDropDownSelectItemInput,
    classNameLoading, classNameEmptyMessage, classNameDropDownHeader,
}: SingleProps<T>) => {

    // Validación para evitar conflictos
    if (process.env.NODE_ENV === "development") {
        if (!!options && !!loadOptions) {
            throw new Error('SingleSelectSearchCheck: No puedes usar "options" y "loadOptions" al mismo tiempo.');
        }
        if (!options && !loadOptions) {
            throw new Error('SingleSelectSearchCheck: Debes pasar "options" (local) O "loadOptions" (async).');
        }
    }

    const refButton = useRef<HTMLButtonElement>(null);
    const refDropDown = useRef<HTMLDivElement>(null);

    const [list, setList] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    // ----------- LOGICA DE DATOS: async o local -----------------
    useEffect(() => {
        if (!open) {
            setList([]);
            setIsLoading(false);
            return;
        }

        // ASYNC/REMOTE
        if (loadOptions) {
            setIsLoading(true);
            loadOptions(debouncedSearch)
                .then((res) => setList(res))
                .catch(() => setList([]))
                .finally(() => setIsLoading(false));
        }
        // LOCAL
        else if (options) {
            setIsLoading(false);
            let filtered = options;
            if (debouncedSearch.trim() !== "") {
                filtered = options.filter((item) => {
                    const val = String(item[rowId] ?? '').toLowerCase();
                    return val.includes(debouncedSearch.toLowerCase());
                });
            }
            setList(filtered);
        }
    }, [debouncedSearch, loadOptions, open, options, rowId]);
    // ------------------------------------------------------------

    // Robustez: agrega el seleccionado al principio si no está (solo para renderizar)
    let finalList = list;
    if (
        selected &&
        !list.some(item => String(item[rowId]) === String(selected[rowId]))
    ) {
        finalList = [selected, ...list];
    }

    // Selected como array para lógica
    const selectedArray = selected != null ? [selected] : [];

    const onClickAddItem = (item: T) => {
        const isSelected = selected != null && String(selected[rowId]) === String(item[rowId]);
        if (isSelected) {
            setSelected(null);
            setSearch("");
        } else {
            setSelected(item);
            setSearch(item[rowId] as unknown as string);
            setOpen(false);
        }
    };

    // Solo los que no están seleccionados
    const filteredItems = finalList.filter(
        (item) => !selectedArray.some((s) => String(s[rowId]) === String(item[rowId]))
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
                        ) : finalList.length === 0 ? (
                            <div className={`${classNameEmptyMessage ?? ""} ${style.loading}`} aria-live="polite">
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredItems
                                .map((item) => {
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
};

export default SingleSelectSearchCheck;


/*

import type { StrictStringKeys } from "./types";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./types";
import style from "./MultiSelectSearchCheck.module.css";
import { useClickOutside } from "../../../../customHooks/useClickOutside";

interface SingleProps<T> {
    rowId: StrictStringKeys<T>;
    search: string;
    setSearch: (search: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    emptyMessage: string;
    labelSelect?: string;
    labelSearch?: string;
    icon?: React.ReactNode;
    placeholder?: string;

    // NUEVO: admite local options
    options?: T[];                       // <--- LOCAL
    loadOptions?: (inputValue: string) => Promise<T[]>; // <--- REMOTO

    // ... resto igual ...
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

    selected: T | null;
    setSelected: (selected: T | null) => void;
}

const SingleSelectSearchCheck = <T,>({
    rowId, selected, setSelected, search, setSearch,
    open, setOpen, emptyMessage, labelSelect, labelSearch,
    icon = <Search size={16} />, placeholder = "Buscar...",
    options, loadOptions, // <-- NUEVO
    classNameContainer, classNameDropDown, classNameInputContainer, classNameInput, classNameButtonInput,
    classNameDropDownSelect, classNameDropDownSearch, classNameDropDownSelectItemSelected,
    classNameDropDownSearchItem, classNameSeparator, classNameDropDownSelectItemInput,
    classNameLoading, classNameEmptyMessage, classNameDropDownHeader,
}: SingleProps<T>) => {

    // Validación para que solo uno exista
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development") {
        if (!!options && !!loadOptions) {
            throw new Error('SingleSelectSearchCheck: No puedes usar "options" y "loadOptions" al mismo tiempo.');
        }
        if (!options && !loadOptions) {
            throw new Error('SingleSelectSearchCheck: Debes pasar "options" (local) O "loadOptions" (async).');
        }
    }

    const refButton = useRef<HTMLButtonElement>(null);
    const refDropDown = useRef<HTMLDivElement>(null);

    const [list, setList] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    // ----------- LOGICA DE DATOS: async o local -----------------
    useEffect(() => {
        if (!open) {
            setList([]);
            setIsLoading(false);
            return;
        }

        // ASYNC/REMOTE
        if (loadOptions) {
            setIsLoading(true);
            loadOptions(debouncedSearch)
                .then((res) => setList(res))
                .catch(() => setList([]))
                .finally(() => setIsLoading(false));
        }
        // LOCAL
        else if (options) {
            setIsLoading(false);
            let filtered = options;
            if (debouncedSearch.trim() !== "") {
                filtered = options.filter((item) => {
                    const val = String(item[rowId] ?? '').toLowerCase();
                    return val.includes(debouncedSearch.toLowerCase());
                });
            }
            setList(filtered);
        }
    }, [debouncedSearch, loadOptions, open, options, rowId]);
    // ------------------------------------------------------------

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
                        ) : list.length === 0 ? (
                            <div className={`${classNameEmptyMessage ?? ""} ${style.loading}`} aria-live="polite">
                                {emptyMessage}
                            </div>
                        ) : (
                            list
                                .filter(item => !selectedArray.some((s) => s[rowId] === item[rowId]))
                                .map((item) => {
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


export default SingleSelectSearchCheck;
*/



/*


import type { StringKeys } from "./types";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./types";
import style from "./MultiSelectSearchCheck.module.css";
import { useClickOutside } from "../../../../customHooks/useClickOutside";
import {
    useFloating,
    offset,
    flip,
    shift,
    size,
    autoUpdate,
} from "@floating-ui/react"; // <- v2+

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

    options?: T[];
    loadOptions?: (inputValue: string) => Promise<T[]>;

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

    selected: T | null;
    setSelected: (selected: T | null) => void;
}

const SingleSelectSearchCheck = <T,>({
    rowId, selected, setSelected, search, setSearch,
    open, setOpen, emptyMessage, labelSelect, labelSearch,
    icon = <Search size={16} />, placeholder = "Buscar...",
    options, loadOptions,
    classNameContainer, classNameDropDown, classNameInputContainer, classNameInput, classNameButtonInput,
    classNameDropDownSelect, classNameDropDownSearch, classNameDropDownSelectItemSelected,
    classNameDropDownSearchItem, classNameSeparator, classNameDropDownSelectItemInput,
    classNameLoading, classNameEmptyMessage, classNameDropDownHeader,
}: SingleProps<T>) => {

    // Validación solo en dev
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development") {
        if (!!options && !!loadOptions) {
            throw new Error('SingleSelectSearchCheck: No puedes usar "options" y "loadOptions" al mismo tiempo.');
        }
        if (!options && !loadOptions) {
            throw new Error('SingleSelectSearchCheck: Debes pasar "options" (local) O "loadOptions" (async).');
        }
    }

    const inputRef = useRef<HTMLInputElement>(null);
    const refButton = useRef<HTMLButtonElement>(null);

    // FLOATING UI V2+
    const {
        refs,
        floatingStyles,
        context,
        placement,
    } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: "bottom-start",
        middleware: [
            offset(4),
            flip(),
            shift({ padding: 6 }),
            size({
                apply({ elements, rects, availableHeight }) {
                    Object.assign(elements.floating.style, {
                        maxWidth: `${rects.reference.width}px`,
                        minWidth: `${rects.reference.width}px`,
                        maxHeight: `${Math.max(200, Math.min(400, availableHeight - 16))}px`
                    });
                }
            }),
        ],
        whileElementsMounted: autoUpdate,
    });

    // Data state
    const [list, setList] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    // LOGICA DE DATOS: async o local
    useEffect(() => {
        if (!open) {
            setList([]);
            setIsLoading(false);
            return;
        }
        // ASYNC/REMOTE
        if (loadOptions) {
            setIsLoading(true);
            loadOptions(debouncedSearch)
                .then((res) => setList(res))
                .catch(() => setList([]))
                .finally(() => setIsLoading(false));
        }
        // LOCAL
        else if (options) {
            setIsLoading(false);
            let filtered = options;
            if (debouncedSearch.trim() !== "") {
                filtered = options.filter((item) => {
                    const val = String(item[rowId] ?? '').toLowerCase();
                    return val.includes(debouncedSearch.toLowerCase());
                });
            }
            setList(filtered);
        }
    }, [debouncedSearch, loadOptions, open, options, rowId]);

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

    useClickOutside(
        [refButton, refs.floating],
        () => {
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
        }
    );

    return (
        <div className={`${classNameContainer ?? ""} ${style.container}`}>
            <div>
                <div
                    className={`${classNameInputContainer ?? ""} ${style.inputContainer}`}
                    ref={refs.setReference}
                >
                    <input
                        ref={inputRef}
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
                    ref={refs.setFloating}
                    className={`${classNameDropDown ?? ""} ${style.dropDown}`}
                    role="listbox"
                    style={{
                        ...floatingStyles,
                        zIndex: 9999,
                        minWidth: refs.reference.current && "offsetWidth" in refs.reference.current
                            ? (refs.reference.current as HTMLElement).offsetWidth
                            : undefined,
                    }}
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
                                    {labelSearch}: {
                                        list.filter(item => !selectedArray.some((s) => s[rowId] === item[rowId])).length
                                    }
                                </span>
                            </div>
                        )}

                        {isLoading ? (
                            <div className={`${classNameLoading ?? ""} ${style.loading}`} aria-live="polite">
                                Cargando...
                            </div>
                        ) : list.length === 0 ? (
                            <div className={`${classNameEmptyMessage ?? ""} ${style.loading}`} aria-live="polite">
                                {emptyMessage}
                            </div>
                        ) : (
                            list
                                .filter(item => !selectedArray.some((s) => s[rowId] === item[rowId]))
                                .map((item) => {
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
};

export default SingleSelectSearchCheck;


*/