import type { KeyboardEvent, KeyboardEventHandler, MouseEvent, MouseEventHandler, ReactNode } from "react";
import InputTextCustom from "./../../../../../comp/primitives/input/text/custom/InputTextCustom";
import PopoverFloating from "../../../../external/floating/pop-over/PopoverFloating";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import useDebounceBasic from "./../../../../../hooks/useDebounceBasic";
import StyleModule from "./SingleSelectCheckSearch.module.css";
import { Divider, Loader } from "@mantine/core";
import { Search } from "lucide-react";
import clsx from "clsx";

interface SingleSelectCheckSearchProps<T> {
    // popover
    initialOpen?: boolean;

    // feedback
    placeholder?: string;
    emptyMessage?: ReactNode;

    // fuente de datos (una u otra)
    options?: T[];
    loadOptions?: (inputValue: string | number, signal: AbortSignal) => Promise<T[]>;
    rowId: (data: T) => string;

    // selección (SINGLE-SELECT)
    selected: T | null;
    setSelected: (selected: T | null) => void;
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

const SingleSelectCheckSearch = <T,>({
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
}: SingleSelectCheckSearchProps<T>) => {
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

    // --- ASYNC
    useEffect(() => {
        if (!open || !loadOptions) return;

        const ac = new AbortController();
        const start = performance.now();

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

    // --- LOCAL
    useEffect(() => {
        if (!open || !options) return;
        setIsLoading(false);
        const term = String(search ?? "").trim().toLowerCase();
        const filtered =
            term === ""
                ? options
                : options.filter((item) => {
                    const val = String(rowId(item) ?? "").toLowerCase();
                    return val.includes(term);
                });
        setList(filtered);
    }, [open, options, rowId, search]);

    // --- Limpieza
    useEffect(() => {
        if (open) return;
        setList([]);
        setIsLoading(false);
    }, [open]);

    // SINGLE-SELECT: final list incluye el seleccionado arriba
    const finalList = useMemo(() => {
        if (!selected) return list;

        const exists = list.some((i) => String(rowId(i)) === String(rowId(selected)));
        const missingSelected = exists ? [] : [selected];

        const combined = [...missingSelected, ...list];

        return combined.filter((item, idx, arr) => {
            const id = String(rowId(item));
            return arr.findIndex((x) => String(rowId(x)) === id) === idx;
        });
    }, [list, selected, rowId]);

    // helpers selección
    const isItemSelected = useCallback(
        (item: T) => selected !== null && String(rowId(selected)) === String(rowId(item)),
        [selected, rowId]
    );

    const toggleItem = useCallback(
        (item: T) => {
            // SINGLE-SELECT real
            if (isItemSelected(item)) {
                setSelected(null); // permite deseleccionar
            } else {
                setSelected(item);
            }
        },
        [isItemSelected, setSelected]
    );

    // todos menos el seleccionado
    const filteredItems = useMemo(
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
                    setOpen={setOpen}
                    setSearch={setSearch}
                />
            }
            classNamePopoverFloating={`${StyleModule.popoverFloating} ${classNameContainerPopover ?? ""}`}
        />
    );
};

const SingleSelectCheckSearchMemo = memo(SingleSelectCheckSearch) as typeof SingleSelectCheckSearch;
export default SingleSelectCheckSearchMemo;

/* ***************** InputDiv ***************** */

interface InputDivProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    classNameFieldSearch?: string;
}

const InputDiv = ({ placeholder, value, onChange, classNameFieldSearch }: InputDivProps) => {
    const handleOnKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
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
    selected: T | null;
    rowId: (data: T) => string;
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
    setOpen: (value: boolean) => void;
    setSearch: (value: string) => void;
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
    setSearch,
    setOpen
}: IPopoverSelectProps<T>) => {
    const classNameNoSelected = clsx(
        isLoading ? StyleModule.containerCheckBoxesNoSelectedLoading : StyleModule.containerCheckBoxesNoSelected,
        classNameContainerCheckBoxesNoSelected
    );

    return (
        <div className={`${StyleModule.containerCheckBoxesMain} ${classNameContainerCheckBoxesMain ?? ""}`}>
            <div className={`${StyleModule.containerCheckBoxesSelected} ${classNameContainerCheckBoxesSelected ?? ""}`}>
                {selected && (
                    <div className={`${StyleModule.containerCheckBoxesSelectedItems} ${classNameContainerCheckBoxesItems ?? ""}`}>
                        <CheckBoxItemMemo
                            key={String(rowId(selected))}
                            setOpen={setOpen}
                            rowId={rowId}
                            item={selected}
                            isSelected
                            toggleItem={toggleItem}
                            classNameCheckBoxItem={classNameCheckBoxItem}
                            classNameCheckBoxItemSelected={classNameCheckBoxItemSelected}
                            classNameLabel={classNameLabel}
                            classNameCheckBox={classNameCheckBox}
                            setSearch={setSearch}
                        />
                    </div>
                )}
            </div>

            {selected && filteredItems.length > 0 && (
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
                                setOpen={setOpen}
                                key={String(rowId(item))}
                                rowId={rowId}
                                item={item}
                                toggleItem={toggleItem}
                                classNameCheckBoxItem={classNameCheckBoxItem}
                                classNameCheckBoxItemSelected={classNameCheckBoxItemSelected}
                                classNameLabel={classNameLabel}
                                classNameCheckBox={classNameCheckBox}
                                setSearch={setSearch}
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
    rowId: (data: T) => string;
    item: T;
    setOpen: (value: boolean) => void;
    isSelected?: boolean;
    toggleItem: (item: T) => void;
    classNameCheckBoxItem?: string;
    classNameLabel?: string;
    classNameCheckBoxItemSelected?: string;
    classNameCheckBox?: string;
    setSearch: (value: string) => void;
}

const CheckBoxItem = <T,>({
    rowId,
    item,
    isSelected = false,
    toggleItem,
    classNameCheckBoxItem,
    setOpen,
    classNameLabel,
    classNameCheckBoxItemSelected,
    classNameCheckBox,
    setSearch
}: ICheckBoxItemProps<T>) => {
    const value = useMemo(() => String(rowId(item) ?? ""), [item, rowId]);

    const handleOnKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(item);
                setSearch(rowId(item));
                setOpen(false);
            }
        },
        [item, toggleItem]
    );

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem(item);
            setSearch(rowId(item));
            setOpen(false);
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
            {/* <input
                id={`id-${value}`}
                type="checkbox"
                role="option"
                checked={isSelected}
                onChange={() => toggleItem(item)}
                readOnly
                tabIndex={-1}
                className={classNameCheckBox}
            /> */}
            <label className={`nunito-regular ${StyleModule.label} ${classNameLabel ?? ""}`} htmlFor={`id-${value}`}>
                {value}
            </label>
        </div>
    );
};

const CheckBoxItemMemo = memo(CheckBoxItem) as typeof CheckBoxItem;
