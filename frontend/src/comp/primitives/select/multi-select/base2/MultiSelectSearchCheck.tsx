import type { StrictStringKeys } from "./../../../../../interfaces/globalTypes";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./../../types";
import style from "./MultiSelectSearchCheck.module.css";

// Floating UI v2+
import {
    useFloating,
    offset,
    flip,
    shift,
    autoUpdate,
    useRole,
    useDismiss,
    useClick,
    useInteractions,
    FloatingPortal,
    FloatingFocusManager,
    size,
} from "@floating-ui/react";

interface MultiSelectSearchCheckProps<T> {
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

    /** Fuente de datos (elige una) */
    options?: T[]; // LOCAL
    loadOptions?: (inputValue: string) => Promise<T[]>; // REMOTO

    /** ClassNames opcionales (mismos que en Single) */
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

    /** Selección múltiple */
    selected: T[];
    setSelected: (selected: T[]) => void;
}

const MultiSelectSearchCheck = <T,>({
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
    options,
    loadOptions,
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
}: MultiSelectSearchCheckProps<T>) => {
    // 1) Validación LOCAL/REMOTE (idéntica al Single)
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development") {
        if (!!options && !!loadOptions) {
            throw new Error('MultiSelectSearchCheckFloating: No puedes usar "options" y "loadOptions" al mismo tiempo.');
        }
        if (!options && !loadOptions) {
            throw new Error('MultiSelectSearchCheckFloating: Debes pasar "options" (local) O "loadOptions" (async).');
        }
    }

    // 2) Floating UI setup (idéntico al Single)
    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: "bottom-start",
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(6),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            size({
                apply({ rects, availableHeight, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${Math.max(180, Math.min(availableHeight - 8, 360))}px`,
                        overflow: "auto",
                        zIndex: 9999,
                    });
                },
            }),
        ],
    });

    // 3) Interacciones Floating (idéntico al Single)
    const role = useRole(context, { role: "listbox" });
    const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true });
    const click = useClick(context, { event: "click" });
    const { getReferenceProps, getFloatingProps } = useInteractions([role, dismiss, click]);

    // 4) Estado de datos
    const [list, setList] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    // 5) Cargar datos (async o local) — mismo patrón que Single
    useEffect(() => {
        if (!open) {
            setList([]);
            setIsLoading(false);
            return;
        }

        if (loadOptions) {
            setIsLoading(true);
            loadOptions(debouncedSearch)
                .then((res) => setList(res ?? []))
                .catch(() => setList([]))
                .finally(() => setIsLoading(false));
        } else if (options) {
            setIsLoading(false);
            let filtered = options;
            if (debouncedSearch.trim() !== "") {
                filtered = options.filter((item) => {
                    const val = String(item[rowId] ?? "").toLowerCase();
                    return val.includes(debouncedSearch.toLowerCase());
                });
            }
            setList(filtered);
        }
    }, [debouncedSearch, loadOptions, open, options, rowId]);

    // 6) Asegurar que los seleccionados estén presentes en la lista (aunque no vengan en la página remota)
    const finalList = useMemo(() => {
        if (!selected || selected.length === 0) return list;
        const selectedIds = new Set(selected.map((s) => String(s[rowId])));
        const missingSelected = selected.filter((s) => !list.some((i) => String(i[rowId]) === String(s[rowId])));
        // Coloca seleccionados primero (útil en UIs densas); si prefieres al final, cambia el spread
        return [...missingSelected, ...list].filter((item, idx, arr) => {
            const id = String(item[rowId]);
            // de-dup
            return arr.findIndex((x) => String(x[rowId]) === id) === idx;
        });
    }, [list, selected, rowId]);

    // 7) Handlers de selección múltiple
    const isItemSelected = (item: T) => selected.some((i) => String(i[rowId]) === String(item[rowId]));

    const toggleItem = (item: T) => {
        if (isItemSelected(item)) {
            setSelected(selected.filter((i) => String(i[rowId]) !== String(item[rowId])));
        } else {
            setSelected([...selected, item]);
        }
    };

    // 8) Ítems disponibles (no seleccionados)
    const filteredItems = finalList.filter((item) => !isItemSelected(item));

    // 9) Al cerrar, no forzamos el search (a diferencia del Single, donde tiene sentido “reflejar” el único seleccionado).
    //    Si quieres limpiar el search al cerrar:
    // useEffect(() => {
    //   if (!open) setSearch("");
    // }, [open, setSearch]);

    // 10) Render
    return (
        <div className={`${classNameContainer ?? ""} ${style.container}`}>
            <div
                className={`${classNameInputContainer ?? ""} ${style.inputContainer}`}
                ref={refs.setReference}
            // {...getReferenceProps()}
            >
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
                    className={`${classNameButtonInput ?? ""} ${style.buttonIconInput}`}
                    onClick={() => setOpen(!open)}
                    type="button"
                    aria-label="Toggle dropdown"
                >
                    {icon}
                </button>
            </div>

            {open && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className={`${classNameDropDown ?? ""} ${style.dropDown}`}
                            role="listbox"
                            aria-multiselectable="true"
                            {...getFloatingProps()}
                        >
                            {/* Seleccionados */}
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
                                        const value = String(item[rowId] ?? "");
                                        return (
                                            <div
                                                key={`sel-${value}`}
                                                className={`${classNameDropDownSelectItemSelected ?? ""} ${style.dropDownSelectItemSelected}`}
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // Evita blur del input/focus manager
                                                    toggleItem(item);
                                                }}
                                                role="option"
                                                aria-selected="true"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") toggleItem(item);
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

                            <div className={`${classNameSeparator ?? ""} ${style.separator}`} />

                            {/* Buscador / disponibles */}
                            <div className={`${classNameDropDownSearch ?? ""} ${style.dropDownSearch}`}>
                                {labelSearch && (
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
                                ) : filteredItems.length === 0 ? (
                                    <div className={`${classNameEmptyMessage ?? ""} ${style.loading}`} aria-live="polite">
                                        {emptyMessage}
                                    </div>
                                ) : (
                                    filteredItems.map((item) => {
                                        const value = String(item[rowId] ?? "");
                                        return (
                                            <div
                                                key={`opt-${value}`}
                                                className={`${classNameDropDownSearchItem ?? ""} ${style.dropDownSearchItem}`}
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // Evita perder foco antes del toggle
                                                    toggleItem(item);
                                                }}
                                                role="option"
                                                aria-selected="false"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") toggleItem(item);
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
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    );
};

export default MultiSelectSearchCheck;
