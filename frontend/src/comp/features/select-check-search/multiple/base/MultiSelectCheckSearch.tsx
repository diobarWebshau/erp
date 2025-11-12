import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, KeyboardEventHandler, MouseEvent, MouseEventHandler, ReactNode } from "react";
import PopoverFloating from "../../../../external/floating/pop-over/PopoverFloating";
import InputTextCustom from "./../../../../../comp/primitives/input/text/custom/InputTextCustom";
import { Search } from "lucide-react";
import useDebounceBasic from "./../../../../../hooks/useDebounceBasic";
import { Divider, Loader } from "@mantine/core";
import clsx from "clsx";
import StyleModule from "./MultiSelectCheckSearch.module.css";

interface MultiSelectCheckSearchProps<T> {
    // popover
    initialOpen?: boolean;

    // feedback
    placeholder?: string;
    emptyMessage?: ReactNode;

    // fuente de datos (una u otra)
    options?: T[];
    loadOptions?: (inputValue: string | number, signal: AbortSignal) => Promise<T[]>;
    rowId: keyof T;

    // selección
    selected: T[];
    setSelected: (selected: T[]) => void;
    colorMain?: string;

    // clases opcionales
    classNameFieldSearch?: string;
    classNameContainerPopover?: string;
    classNameContainerCheckBoxesMain?: string;
    classNameContainerCheckBoxesSelected?: string;
    classNameContainerCheckBoxesNoSelected?: string;
    classNameContainerCheckBoxesItems?: string;
    classNameContainerEmptyMessage?: string;
    classNameCheckBoxItem?: string;
    classNameCheckBoxItemSelected?: string;
    classNameLabel?: string;
    classNameCheckBox?: string;

    // layout
    maxHeight?: string;
}

const MIN_SPINNER_MS = 200;

const MultiSelectCheckSearch = <T,>({
    initialOpen,
    placeholder,
    emptyMessage,
    options,
    loadOptions,
    rowId,
    selected,
    setSelected,
    colorMain = "black",
    classNameFieldSearch,
    classNameContainerPopover,
    classNameContainerCheckBoxesMain,
    classNameContainerCheckBoxesSelected,
    classNameContainerCheckBoxesNoSelected,
    classNameContainerCheckBoxesItems,
    classNameContainerEmptyMessage,
    classNameCheckBoxItem,
    classNameCheckBoxItemSelected,
    classNameLabel,
    classNameCheckBox,
    maxHeight,
}: MultiSelectCheckSearchProps<T>) => {
    // estado de búsqueda
    const [search, setSearch] = useState<string>("");
    const debouncedSearch = useDebounceBasic({ value: search, delay: 300 });

    // datos + UI
    const [list, setList] = useState<T[]>([]);
    const [open, setOpen] = useState<boolean>(initialOpen ?? false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 🔹 PRE-FETCH: muestra loader durante el debounce (sólo modo remoto)
    useEffect(() => {
        if (!open || !loadOptions) return;
        setIsLoading(true);
    }, [open, loadOptions, search]);

    // --- ASYNC: sólo cuando hay loadOptions; depende de open + debouncedSearch + loadOptions
    useEffect(() => {
        if (!open || !loadOptions) return;

        const ac = new AbortController();
        const start = performance.now();
        // (isLoading ya se activó en el efecto de arriba)

        Promise.resolve(loadOptions(debouncedSearch, ac.signal))
            .then((res) => {
                if (!ac.signal.aborted) setList(res ?? []);
            })
            .catch(() => {
                if (!ac.signal.aborted) setList([]);
            })
            .finally(() => {
                if (ac.signal.aborted) return;
                const elapsed = performance.now() - start;
                const wait = Math.max(0, MIN_SPINNER_MS - elapsed);
                const t = setTimeout(() => {
                    if (!ac.signal.aborted) setIsLoading(false);
                }, wait);
                ac.signal.addEventListener("abort", () => clearTimeout(t));
            });

        return () => ac.abort();
    }, [open, debouncedSearch, loadOptions]);

    // --- LOCAL: sólo cuando hay options; depende de open + options + search
    useEffect(() => {
        if (!open || !options) return;
        // local no usa loader
        setIsLoading(false);
        const term = String(search ?? "").trim().toLowerCase();
        const filtered =
            term === ""
                ? options
                : options.filter((item) => {
                    const val = String(item[rowId] ?? "").toLowerCase();
                    return val.includes(term);
                });
        setList(filtered);
    }, [open, options, rowId, search]);

    // --- Limpieza al cerrar el popover
    useEffect(() => {
        if (open) return;
        setList([]);
        setIsLoading(false);
    }, [open]);

    // Asegura que los seleccionados estén presentes
    const finalList = useMemo(() => {
        if (!selected || selected.length === 0) return list;
        const missingSelected = selected.filter(
            (s) => !list.some((i) => String(i[rowId]) === String(s[rowId]))
        );
        return [...missingSelected, ...list].filter((item, idx, arr) => {
            const id = String(item[rowId]);
            return arr.findIndex((x) => String(x[rowId]) === id) === idx;
        });
    }, [list, selected, rowId]);

    // helpers selección
    const isItemSelected = useCallback(
        (item: T) => selected.some((i) => String(i[rowId]) === String(item[rowId])),
        [selected, rowId]
    );

    const toggleItem = useCallback(
        (item: T) => {
            if (isItemSelected(item)) {
                setSelected(selected.filter((i) => String(i[rowId]) !== String(item[rowId])));
            } else {
                setSelected([...selected, item]);
            }
        },
        [isItemSelected, selected, rowId, setSelected]
    );

    const filteredItems: T[] = useMemo(
        () => finalList.filter((item) => !isItemSelected(item)),
        [finalList, isItemSelected]
    );

    return (
        <PopoverFloating
            open={open}
            initialOpen={initialOpen}
            setOpen={setOpen}
            {...(maxHeight && { maxHeight })}
            childrenTrigger={
                <InputDivMemo
                    value={search}
                    onChange={setSearch}
                    placeholder={placeholder}
                    classNameFieldSearch={classNameFieldSearch}
                />
            }
            childrenFloating={
                <PopoverSelectMemo
                    filteredItems={filteredItems}
                    selected={selected}
                    rowId={rowId}
                    toggleItem={toggleItem}
                    isLoading={isLoading}
                    EmptyMessage={emptyMessage}
                    colorMain={colorMain}
                    classNameContainerCheckBoxesMain={classNameContainerCheckBoxesMain}
                    classNameContainerCheckBoxesSelected={classNameContainerCheckBoxesSelected}
                    classNameContainerCheckBoxesNoSelected={classNameContainerCheckBoxesNoSelected}
                    classNameContainerCheckBoxesItems={classNameContainerCheckBoxesItems}
                    classNameContainerEmptyMessage={classNameContainerEmptyMessage}
                    classNameCheckBoxItem={classNameCheckBoxItem}
                    classNameCheckBoxItemSelected={classNameCheckBoxItemSelected}
                    classNameLabel={classNameLabel}
                    classNameCheckBox={classNameCheckBox}
                />
            }
            classNamePopoverFloating={`${StyleModule.popoverFloating} ${classNameContainerPopover ?? ""}`}
        />
    );
};

const MultiSelectCheckSearchMemo = memo(MultiSelectCheckSearch) as typeof MultiSelectCheckSearch;
export default MultiSelectCheckSearchMemo;

/* ***************** InputDiv ***************** */

interface InputDivProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    classNameFieldSearch?: string;
}

const InputDiv = ({ placeholder, value, onChange, classNameFieldSearch }: InputDivProps) => {
    const handleOnKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
        // permite espacio en el input sin burbujeo
        if (e.key === " ") e.stopPropagation();
    };

    return (
        <div
            onKeyDownCapture={handleOnKeyDownCapture}
            className={`${StyleModule.containerFieldSearch} ${classNameFieldSearch ?? ""}`}
        >
            <InputTextCustom placeholder={placeholder} value={value} onChange={onChange} icon={<Search />} />
        </div>
    );
};

const InputDivMemo = memo(InputDiv) as typeof InputDiv;

/* *************** PopoverSelect *************** */

interface IPopoverSelectProps<T> {
    filteredItems: T[];
    selected: T[];
    rowId: keyof T;
    toggleItem: (item: T) => void;
    isLoading?: boolean;
    EmptyMessage?: React.ReactNode;
    colorMain?: string;
    classNameContainerCheckBoxesMain?: string;
    classNameContainerCheckBoxesSelected?: string;
    classNameContainerCheckBoxesNoSelected?: string;
    classNameContainerCheckBoxesItems?: string;
    classNameCheckBoxItem?: string;
    classNameCheckBoxItemSelected?: string;
    classNameLabel?: string;
    classNameContainerEmptyMessage?: string;
    classNameCheckBox?: string;
}

const PopoverSelect = <T,>({
    filteredItems,
    selected,
    rowId,
    toggleItem,
    isLoading,
    EmptyMessage,
    colorMain,
    classNameContainerCheckBoxesMain,
    classNameContainerCheckBoxesSelected,
    classNameContainerCheckBoxesNoSelected,
    classNameContainerCheckBoxesItems,
    classNameCheckBoxItem,
    classNameCheckBoxItemSelected,
    classNameLabel,
    classNameContainerEmptyMessage,
    classNameCheckBox,
}: IPopoverSelectProps<T>) => {
    const classNameNoSelected = clsx(
        isLoading ? StyleModule.containerCheckBoxesNoSelectedLoading : StyleModule.containerCheckBoxesNoSelected,
        classNameContainerCheckBoxesNoSelected
    );

    return (
        <div className={`${StyleModule.containerCheckBoxesMain} ${classNameContainerCheckBoxesMain ?? ""}`}>
            <div className={`${StyleModule.containerCheckBoxesSelected} ${classNameContainerCheckBoxesSelected ?? ""}`}>
                {selected.length > 0 && (
                    <div className={`${StyleModule.containerCheckBoxesSelectedItems} ${classNameContainerCheckBoxesItems ?? ""}`}>
                        {selected.map((item) => (
                            <CheckBoxItemMemo
                                key={String(item[rowId])}
                                rowId={rowId}
                                item={item}
                                isSelected
                                toggleItem={toggleItem}
                                classNameCheckBoxItem={classNameCheckBoxItem}
                                classNameCheckBoxItemSelected={classNameCheckBoxItemSelected}
                                classNameLabel={classNameLabel}
                                classNameCheckBox={classNameCheckBox}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selected.length > 0 && filteredItems.length > 0 && (
                <Divider orientation="horizontal" color={colorMain} />
            )}

            <div className={classNameNoSelected}>
                {isLoading ? (
                    <div className={StyleModule.containerLoading}>
                        <Loader className={StyleModule.loadingIcon} type="oval" color="var(--color-theme-primary)" size="xs" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className={`${StyleModule.containerEmptyMessage} ${classNameContainerEmptyMessage ?? ""}`}>
                        {EmptyMessage}
                    </div>
                ) : (
                    <div className={`${StyleModule.containerCheckBoxesNoSelectedItems} ${classNameContainerCheckBoxesItems ?? ""}`}>
                        {filteredItems.map((item) => (
                            <CheckBoxItemMemo
                                key={String(item[rowId])}
                                rowId={rowId}
                                item={item}
                                toggleItem={toggleItem}
                                classNameCheckBoxItem={classNameCheckBoxItem}
                                classNameCheckBoxItemSelected={classNameCheckBoxItemSelected}
                                classNameLabel={classNameLabel}
                                classNameCheckBox={classNameCheckBox}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PopoverSelectMemo = memo(PopoverSelect) as typeof PopoverSelect;

/* *************** CheckBoxItem *************** */

interface ICheckBoxItemProps<T> {
    rowId: keyof T;
    item: T;
    isSelected?: boolean;
    toggleItem: (item: T) => void;
    classNameCheckBoxItem?: string;
    classNameLabel?: string;
    classNameCheckBoxItemSelected?: string;
    classNameCheckBox?: string;
}

const CheckBoxItem = <T,>({
    rowId,
    item,
    isSelected = false,
    toggleItem,
    classNameCheckBoxItem,
    classNameLabel,
    classNameCheckBoxItemSelected,
    classNameCheckBox,
}: ICheckBoxItemProps<T>) => {
    const value = useMemo(() => String(item[rowId] ?? ""), [item, rowId]);

    const handleOnKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(item);
            }
        },
        [item, toggleItem]
    );

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem(item);
        },
        [item, toggleItem]
    );

    return (
        <div
            onKeyDown={handleOnKeyDown}
            onMouseDown={handleMouseDown}
            tabIndex={0}
            className={`${StyleModule.checkBoxItem} ${isSelected ? classNameCheckBoxItemSelected ?? "" : classNameCheckBoxItem ?? ""}`}
        >
            <input
                id={`id-${value}`}
                type="checkbox"
                role="option"
                checked={isSelected}
                onChange={() => toggleItem(item)}
                readOnly
                tabIndex={-1}
                className={classNameCheckBox}
            />
            <label className={`nunito-regular ${StyleModule.label} ${classNameLabel ?? ""}`} htmlFor={`id-${value}`}>
                {value}
            </label>
        </div>
    );
};

const CheckBoxItemMemo = memo(CheckBoxItem) as typeof CheckBoxItem;
