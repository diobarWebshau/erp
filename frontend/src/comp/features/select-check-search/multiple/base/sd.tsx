import { memo, useCallback, useEffect, useMemo, useState, type KeyboardEvent, type KeyboardEventHandler, type MouseEvent, type MouseEventHandler, type ReactNode } from "react";
import PopoverFloating from "../../../../external/floating/pop-over/PopoverFloating"
import InputTextCustom from "./../../../../../comp/primitives/input/text/custom/InputTextCustom";
import { Loader, Search } from "lucide-react";
import useDebounceBasic from "./../../../../../hooks/useDebounceBasic"
import { Divider } from "@mantine/core";
import StyleModule from "./MultiSelectCheckSearch.module.css"

interface MultiSelectCheckSearchProps<T> {

    // props para el manejo del popover
    initialOpen?: boolean;

    // props de retroalimentacion
    placeholder?: string;
    emptyMessage?: ReactNode;

    // props para la fuente de datos(Solo se puede habilitar una a la vez)
    options?: T[]
    loadOptions?: (inputValue: string | number) => Promise<T[]>;
    rowId: keyof T;

    // props para el estado de seleccion
    selected: T[];
    setSelected: (selected: T[]) => void;
    colorMain?: string;

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
    maxHeight?: string;
}

const MultiSelectCheckSearch = <T,>({
    initialOpen,
    placeholder, emptyMessage,
    options,
    loadOptions,
    rowId,
    selected, setSelected,
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

    // variable para el manejo del search
    const [search, setSearch] = useState<string>("");
    // variable para la lista de datos
    const [list, setList] = useState<T[]>([]);
    // variable para el manejo del search
    const [open, setOpen] = useState<boolean>(initialOpen ?? false);
    // variable para el manejo del loading
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // ?  variable para el manejo del search, se usa para evitar que se renderize cada vez que el valor cambie en cada tecla
    const debouncedSearch = useDebounceBasic({ value: search, delay: 300 });

    // ?  Efecto para cargar los datos(async o local) 
    useEffect(() => {
        // Si el popover no esta abierto, se coloca la lista vacia
        if (!open) {
            setList([]);
            return;
        }
        if (loadOptions) { // Si se habilita la fuente de datos async
            // Se establece un estado de loading
            setIsLoading(true);
            // Se llama a la fuente de datos async
            loadOptions(debouncedSearch)
                .then((res) => setList(res ?? []))
                .catch(() => setList([]))
                .finally(() => setIsLoading(false));
        } else if (options) { // Si se habilita la fuente de datos local  
            // Se establece un estado de no loading
            setIsLoading(false);
            // Se filtra la lista de datos
            let filtered = options;
            // Si el search no esta vacio
            if (search.trim() !== "") {
                // Se filtra la lista de datos
                filtered = options.filter((item) => {
                    const val = String(item[rowId] ?? "").toLowerCase();
                    return val.includes(search.toLowerCase());
                });
            }
            // Se coloca la lista de datos
            setList(filtered);
        }
    }, [search, loadOptions, options, open, debouncedSearch]);

    // ? Esta variable es para asegurar que los seleccionados estén presentes en la lista (aunque no vengan en la página remota)
    const finalList = useMemo(() => {
        // Si no hay seleccionados, se coloca la lista de datos
        if (!selected || selected.length === 0) return list;
        // Se crea un set de los ids de los seleccionados
        // const selectedIds = new Set(selected.map((s) => String(s[rowId])));
        // Se filtra la lista de datos( los que no esten seleccionados)
        const missingSelected = selected.filter((s) => !list.some((i) => String(i[rowId]) === String(s[rowId])));
        // Coloca seleccionados primero (útil en UIs densas); si prefieres al final, cambia el spread
        return [...missingSelected, ...list].filter((item, idx, arr) => { // Para evitar que haya duplicados
            const id = String(item[rowId]); // Obtiene el id del item
            return arr.findIndex((x) => String(x[rowId]) === id) === idx; // Si el id es el mismo, se coloca el item
        });
    }, [list, selected, rowId]);


    // ? Esta function es para verificar si un item esta seleccionado
    const isItemSelected = useCallback((item: T) => selected.some((i) => String(i[rowId]) === String(item[rowId])), [selected, rowId]);

    // ? Esta function es para alternar la seleccion de un item
    const toggleItem = useCallback((item: T) => {
        if (isItemSelected(item)) {
            setSelected(selected.filter((i) => String(i[rowId]) !== String(item[rowId])));
        } else {
            setSelected([...selected, item]);
        }
    }, [isItemSelected, selected, rowId]);

    // ? Esta variable es para obtener los items disponibles (no seleccionados)
    const filteredItems: T[] = useMemo(() => finalList.filter((item) => !isItemSelected(item)), [finalList, isItemSelected]);

    return <PopoverFloating
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
                finalList={finalList}
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
        classNamePopoverFloating={`${StyleModule.popoverFloating} ${classNameContainerPopover}`}
    />
}

const MultiSelectCheckSearchMemo = memo(MultiSelectCheckSearch) as typeof MultiSelectCheckSearch;

export default MultiSelectCheckSearchMemo;

/* * ******** InputDiv ******** */

interface InputDivProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    classNameFieldSearch?: string;
}

const InputDiv = ({
    placeholder,
    value,
    onChange,
    classNameFieldSearch,
}: InputDivProps) => {

    const handleOnKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
        // No hacemos el e.preventDefault() para que el input escriba el espacio
        // Deja que el input escriba el espacio, pero evita que el evento burbujee,
        if (e.key === " ") {
            e.stopPropagation();
        }
    };

    return <div
        onKeyDownCapture={handleOnKeyDownCapture}
        className={`${StyleModule.containerFieldSearch} ${classNameFieldSearch}`}
    >
        <InputTextCustom
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            icon={<Search />}
        />
    </div>
}

const InputDivMemo = memo(InputDiv) as typeof InputDiv;

// * ******** MultiSelectCheckSearch ******** */

interface IPopoverSelectProps<T> {
    filteredItems: T[];
    finalList: T[];
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
    finalList,
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
    return (
        <div className={`${StyleModule.containerCheckBoxesMain} ${classNameContainerCheckBoxesMain}`}>
            <div className={`${StyleModule.containerCheckBoxesSelected} ${classNameContainerCheckBoxesSelected}`}>
                {
                    selected.length > 0 && (
                        <div className={`${StyleModule.containerCheckBoxesSelectedItems} ${classNameContainerCheckBoxesItems}`}>
                            {
                                selected.map((item) => {
                                    return <CheckBoxItemMemo
                                        rowId={rowId}
                                        item={item}
                                        isSelected
                                        toggleItem={toggleItem}
                                        classNameCheckBoxItem={classNameCheckBoxItem}
                                        classNameCheckBoxItemSelected={classNameCheckBoxItemSelected}
                                        classNameLabel={classNameLabel}
                                        classNameCheckBox={classNameCheckBox}
                                    />
                                })
                            }
                        </div>
                    )
                }
            </div>
            {
                (selected.length > 0 && filteredItems.length > 0) && (
                    <Divider orientation="horizontal" color={colorMain} />
                )
            }
            <div className={`${StyleModule.containerCheckBoxesNoSelected} ${classNameContainerCheckBoxesNoSelected}`}>
                {
                    (filteredItems.length === 0 || finalList.length === 0)
                        ? (
                            <div className={`${StyleModule.containerEmptyMessage} ${classNameContainerEmptyMessage}`}>
                                {EmptyMessage}
                            </div>
                        )
                        : (
                            isLoading ? (
                                <div>
                                    <Loader type='oval' />
                                </div>
                            ) : (
                                <div className={`${StyleModule.containerCheckBoxesNoSelectedItems} ${classNameContainerCheckBoxesItems}`}>
                                    {
                                        filteredItems.map((item) => {
                                            return <CheckBoxItemMemo
                                                rowId={rowId}
                                                item={item}
                                                toggleItem={toggleItem}
                                                classNameCheckBoxItem={classNameCheckBoxItem}
                                                classNameCheckBoxItemSelected={classNameCheckBoxItemSelected}
                                                classNameLabel={classNameLabel}
                                                classNameCheckBox={classNameCheckBox}
                                            />
                                        })
                                    }
                                </div>
                            )
                        )
                }
            </div>
        </div>
    );
}

const PopoverSelectMemo = memo(PopoverSelect) as typeof PopoverSelect;


// * ********** CheckBoxItem ********** */

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

    const handleOnKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        // Esto evita que el input pierda el focus
        // Esto evita que el evento se propague hacia los componentes padres
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            toggleItem(item);
        }
    }, [item]);

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();   // mantiene el foco en el input de búsqueda
        e.stopPropagation();  // no burbujea al trigger del popover
        toggleItem(item);
    }, [item, toggleItem]);

    return (
        <div
            key={String(item[rowId])}
            onKeyDown={handleOnKeyDown}
            onMouseDown={handleMouseDown}
            tabIndex={0}
            className={`${StyleModule.checkBoxItem} ${isSelected ? classNameCheckBoxItemSelected : classNameCheckBoxItem}`}
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
            <label className={`nunito-regular ${StyleModule.label} ${classNameLabel}`} htmlFor={`id-${value}`}>{value}</label>
        </div>
    );
}

const CheckBoxItemMemo = memo(CheckBoxItem) as typeof CheckBoxItem;
