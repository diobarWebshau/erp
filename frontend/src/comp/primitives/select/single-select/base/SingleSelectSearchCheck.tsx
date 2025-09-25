import type { StrictStringKeys } from "./../../../../../interfaces/globalTypes";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";   
import { useDebounce,  } from "./../../types";
import style from "./multiSelectSearchCheckFloating.module.css";

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

interface SingleSelectSearchCheckProps<T> {
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

    options?: T[]; // LOCAL
    loadOptions?: (inputValue: string) => Promise<T[]>; // REMOTO

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
}: SingleSelectSearchCheckProps<T>) => {

    // 1. Validación para evitar conflictos LOCAL/REMOTE
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development") {
        if (!!options && !!loadOptions) {
            throw new Error('SingleSelectSearchCheckFloating: No puedes usar "options" y "loadOptions" al mismo tiempo.');
        }
        if (!options && !loadOptions) {
            throw new Error('SingleSelectSearchCheckFloating: Debes pasar "options" (local) O "loadOptions" (async).');
        }
    }

    // 2. Floating UI setup
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

    // 3. Floating UI interacciones (solo el botón es reference)
    const role = useRole(context, { role: "listbox" });
    const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true });
    const click = useClick(context, { event: "click" });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        role,
        dismiss,
        click,
    ]);

    // 4. Data state
    const [list, setList] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    // 5. Cargar datos (async o local)
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

    // 6. Para renderizar: asegura que el seleccionado esté siempre presente en la lista
    const finalList = useMemo(() => {
        if (!selected) return list;
        const exists = list.some(item => String(item[rowId]) === String(selected[rowId]));
        return exists ? list : [selected, ...list];
    }, [list, selected, rowId]);

    const selectedArray = selected != null ? [selected] : [];

    // 7. Manejo de selección
    const onClickAddItem = (item: T) => {
        const isSelected = selected != null && String(selected[rowId]) === String(item[rowId]);
        if (isSelected) {
            setSelected(null);
            setSearch("");
        } else {
            setSelected(item);
            setSearch(String(item[rowId] ?? ""));
            setOpen(false);
        }
    };

    // 8. Filtra items no seleccionados para mostrar en la lista
    const filteredItems = finalList.filter(
        (item) => !selectedArray.some((s) => String(s[rowId]) === String(item[rowId]))
    );

    // 9. Al cerrar, restaura el search con el valor del seleccionado (o vacío)
    useEffect(() => {
        if (!open && selected != null) {
            const value = selected[rowId];
            if (typeof value === "string") setSearch(value);
            else if (value != null) setSearch(String(value));
            else setSearch("");
        }
    }, [open, selected, rowId, setSearch]);

    // 10. Render
    return (
        <div className={`${classNameContainer ?? ""} ${style.container}`}>
            <div className={`${classNameInputContainer ?? ""} ${style.inputContainer}`}
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

            {/* Dropdown flotante */}
            {open && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className={`${classNameDropDown ?? ""} ${style.dropDown}`}
                            role="listbox"
                            {...getFloatingProps()}
                        >
                            {/* Seleccionado */}
                            {selectedArray.length > 0 && (
                                <div className={`${classNameDropDownSelect ?? ""} ${style.dropDownSelect}`}>
                                    {labelSelect && (
                                        <div className={`${classNameDropDownHeader ?? ""} ${style.dropDownhHeader}`}>
                                            <span>
                                                {labelSelect}: {selectedArray.length}
                                            </span>
                                        </div>
                                    )}
                                    {selectedArray.map((item) => {
                                        const value = String(item[rowId] ?? "");
                                        return (
                                            <div
                                                key={value}
                                                className={`${classNameDropDownSelectItemSelected ?? ""} ${style.dropDownSelectItemSelected}`}
                                                onMouseDown={e => {
                                                    e.preventDefault();
                                                    onClickAddItem(item);
                                                }}
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
                                {selectedArray.length > 0 && labelSearch && (
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
                                    filteredItems.map((item) => {
                                        const value = String(item[rowId] ?? "");
                                        return (
                                            <div
                                                key={value}
                                                className={`${classNameDropDownSearchItem ?? ""} ${style.dropDownSearchItem}`}
                                                onMouseDown={e => {
                                                    e.preventDefault();
                                                    onClickAddItem(item);
                                                }}
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
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    );
};

export default SingleSelectSearchCheck;
