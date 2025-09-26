import React, {
    useState,
    useEffect,
    useRef,
    type MouseEvent,
    type RefObject,
} from "react";
import ReactDOM from "react-dom";
import {
    MoreVertical,
    ChevronDown,
    ChevronUp,
    XCircle,
    Search,
    ChevronLeft,
    Plus,
} from "lucide-react";
import BooleanInput
    from "../../gui/filter/boolean-input/BooleanInput";
import EnumSelectInput
    from "../../gui/filter/enum-input/EnumInput";
import type { Column, Header, Table } from "@tanstack/react-table";
import stylesModules
    from "./HeaderPopoverOptions.module.css";
import FadeButton
    from "../../gui/button/fade-button/FadeButton";
import type { DateRange } from "react-day-picker";
import DateDayPicker
    from "../../gui/date-day-picker/DateDayPicker";
import RadioButtonsWithIcons
    from "../../gui/CheckBoxButtonOptions/CheckBoxButtonOptions";
import CheckBoxWithSearch
    from "../../gui/checkBoxWithSearch/CheckBoxWithSearch";
import NumberSlicerReactRange
    from "../../gui/react-slicer/ReactSlicer";
import {
    type BooleanFilter,
    type ColumnTypeDataFilter,
    type ObjectNumericFilter,
    type EnumFilter,
    type ObjectDateFilter,
    getDefaultResetValue,
} from "../../../types";
import {
    useTableDispatch,
    useTableState
} from "../../../tableContext/tableHooks";
import {
    remove_column_filter,
    remove_sorting,
} from "../../../tableContext/tableActions";
import {
    useFloating,
    offset, flip,
    shift, autoUpdate
} from "@floating-ui/react-dom";
import {
    useClickOutside
} from "../../../customHooks/useClickOutside";

interface HeaderPopoverOptionsProps<T> {
    header: Header<T, unknown>;
    column: Column<T>;
    table: Table<T>;
    setIsVisibleFilterPopover: (isVisibleFilterPopover: string | null) => void;
    filterTriggerRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
    filterPopoverRef: RefObject<HTMLDivElement | null>;
    isVisibleFilterPopover: string | null;
    onClickFilter: (e: MouseEvent<HTMLButtonElement>, column: Column<T>) => void;
    onClickAddFilter: (
        e: MouseEvent<HTMLButtonElement>,
        column: Column<T>,
        value: ColumnTypeDataFilter
    ) => void;
}

function HeaderPopoverOptions<T>({
    header,
    column,
    table,
    filterPopoverRef,
    filterTriggerRefs,
    onClickFilter,
    onClickAddFilter,
    isVisibleFilterPopover,
    setIsVisibleFilterPopover,
}: HeaderPopoverOptionsProps<T>) {
    const state = useTableState();
    const dispatch = useTableDispatch();

    // Estado local del valor del input de filtro
    const [inputValueLocal, setInputValueLocal] = useState<ColumnTypeDataFilter | undefined>(
        state.columnFiltersState.find((filter) => filter.id === column.id)?.value as
        | ColumnTypeDataFilter
        | undefined
    );

    const meta = column.columnDef.meta;
    const columnId = column.id;
    const isFilterable = column.getFacetedRowModel().rows.length > 0;

    // Floating UI setup
    const { x, y, strategy, refs, update, floatingStyles } = useFloating({
        placement: "bottom-start",
        middleware: [offset(6), flip(), shift({ padding: 8 })],
    });

    // Refs para el trigger y popover, con setters para floating-ui
    const floatingRef = useRef<HTMLDivElement | null>(null);
    const referenceRef = useRef<HTMLButtonElement | null>(null);

    const setFloating = (node: HTMLDivElement | null) => {
        floatingRef.current = node;
        refs.setFloating(node);
        // Para mantener la referencia externa
        if (filterPopoverRef && typeof filterPopoverRef === "object") {
            (filterPopoverRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
    };

    const setReference = (node: HTMLButtonElement | null) => {
        referenceRef.current = node;
        refs.setReference(node);
        if (node) filterTriggerRefs.current[columnId] = node;
    };

    // Auto update posición
    useEffect(() => {
        if (!referenceRef.current || !floatingRef.current) return;
        return autoUpdate(referenceRef.current, floatingRef.current, update);
    }, [referenceRef, floatingRef, update]);

    // Cerrar popover con click fuera del trigger o popover
    useClickOutside([floatingRef, referenceRef], () => {
        if (isVisibleFilterPopover === columnId) {
            setIsVisibleFilterPopover(null);
        }
    });

    const open = isVisibleFilterPopover === columnId;

    // Funciones sin cambios
    const onChangeInput = (value: ColumnTypeDataFilter) => {
        setInputValueLocal(value);
    };

    const applyFilterInColumn = (e: MouseEvent<HTMLButtonElement>) => {
        onClickAddFilter(e, column, inputValueLocal);
        onClickFilter(e, column);
    };

    const handleRangeChange = (rangeOrDate: DateRange | Date | undefined) => {
        if (!rangeOrDate) return;

        if ("from" in rangeOrDate) {
            // rango
            console.log("Rango seleccionado:", rangeOrDate);
            console.log(
                `Desde: ${rangeOrDate.from?.toISOString() ?? "n/a"} - Hasta: ${rangeOrDate.to?.toISOString() ?? "n/a"
                }`
            );
        } else if (rangeOrDate instanceof Date) {
            // fecha única
            console.log("Fecha seleccionada:", rangeOrDate.toISOString());
        } else {
            console.log("Tipo desconocido:", rangeOrDate);
        }
    };

    const handleOnClickCancelButton = (e: MouseEvent<HTMLButtonElement>) => {
        setIsVisibleFilterPopover(null);
        setInputValueLocal(
            state.columnFiltersState.find((filter) => filter.id === column.id)?.value as
            | ColumnTypeDataFilter
            | undefined
        );
    };

    const handleResetChanges = () => {
        dispatch(remove_column_filter(column.id));
        dispatch(remove_sorting(column.id));
        setInputValueLocal(getDefaultResetValue(meta?.type as string));
    };

    const isButtonAddFilterDisabled = () => {
        let value: ColumnTypeDataFilter;
        switch (meta?.type) {
            case "boolean":
                value = inputValueLocal as BooleanFilter;
                return value === undefined;
            case "string":
                value = (inputValueLocal as string[]) || [];
                return value.length === 0;
            case "number":
                value = inputValueLocal as ObjectNumericFilter;
                return value?.max === undefined && value?.min === undefined;
            case "date":
                value = inputValueLocal as ObjectDateFilter;
                return value?.from === undefined && value?.to === undefined;
            case "enum":
                value = inputValueLocal as EnumFilter;
                return value === undefined || value.length === 0;
            default:
                return true;
        }
    };

    // Sincronizar valor input con estado global al abrir popover
    useEffect(() => {
        if (open) {
            const globalValue = state.columnFiltersState.find(
                (filter) => filter.id === column.id
            )?.value as ColumnTypeDataFilter | undefined;
            setInputValueLocal(globalValue);
        }
    }, [open, column.id, state.columnFiltersState]);

    // Portal root para renderizar popover (igual que ejemplo)
    const portalRoot = useRef<Element | null>(null);
    useEffect(() => {
        if (typeof document !== "undefined") {
            let existingRoot = document.getElementById("floating-ui-portal-root");
            if (!existingRoot) {
                existingRoot = document.createElement("div");
                existingRoot.setAttribute("id", "floating-ui-portal-root");
                document.body.appendChild(existingRoot);
            }
            portalRoot.current = existingRoot;
        }
    }, []);

    useEffect(() => {
        if (!open) return; // Solo activa autoUpdate si está abierto
        if (!referenceRef.current || !floatingRef.current) return;

        return autoUpdate(referenceRef.current, floatingRef.current, update);
    }, [open, update]);


    const popoverContent = (
        <div
            ref={setFloating}
            className={stylesModules.popoverOptions}
            style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                ...floatingStyles,
                zIndex: 10000,
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
            }}
            role="dialog"
            aria-modal="true"
        >
            {open && (
                <>
                    <section className={`nunito-semibold ${stylesModules.sortSection}`}>
                        <RadioButtonsWithIcons
                            options={[
                                { label: "Ascending Order", icon: <ChevronUp /> },
                                { label: "Descending Order", icon: <ChevronDown /> },
                            ]}
                            typeOrderIcon="first"
                            classNameContainer={stylesModules.groupButtons}
                            classNameButton={stylesModules.labelButton}
                            classNameSelected={stylesModules.selected}
                            column={column}
                        />
                    </section>

                    <div className={stylesModules.separator}></div>

                    <section className={`nunito-semibold ${stylesModules.filterSection}`}>
                        {meta?.type === "string" && (
                            <CheckBoxWithSearch
                                options={table
                                    .getPreFilteredRowModel()
                                    .rows.map((row) => row.getValue(columnId))
                                    .filter((v): v is string => typeof v === "string")
                                    .filter((v, i, arr) => arr.indexOf(v) === i)}
                                value={inputValueLocal}
                                onChange={onChangeInput}
                                classNameContainer={stylesModules.ListCheckboxContainer}
                                classNameGroupOptions={stylesModules.ListCheckboxGroupOptions}
                                classNameOption={stylesModules.ListCheckboxOption}
                                classNameSelectedOption={stylesModules.ListCheckboxOptionSelected}
                                classNameInputOption={stylesModules.ListCheckboxInputOption}
                                classNameContainerSearch={stylesModules.ListCheckboxContainerSearch}
                                classNameInputSearch={stylesModules.ListCheckboxInputSearch}
                                classNameButtonSearch={stylesModules.ListCheckboxButtonSearch}
                                iconSearch={<Search className={stylesModules.ListCheckIconSearch} />}
                            />
                        )}
                        {meta?.type === "number" && (
                            <NumberSlicerReactRange
                                min={0}
                                max={Math.max(
                                    ...table
                                        .getPreFilteredRowModel()
                                        .rows.map((row) => Number(row.getValue(columnId)))
                                        .filter((n) => !isNaN(n))
                                )}
                                step={1}
                                initialValue={inputValueLocal as ObjectNumericFilter}
                                setInitialValue={setInputValueLocal}
                                label="Value range"
                                width={"100%"}
                                className={stylesModules.numberSlicer}
                                classNameFontContainer={"nunito-semibold"}
                                classNameSubTitleMinMax={"nunito-bold"}
                                classNameTrack={stylesModules.track}
                                afterRangeColor="#DEDDF8"
                                rangeColor="#423DD9"
                                beforeRangeColor="#DEDDF8"
                            />
                        )}

                        {meta?.type === "date" && (
                            <DateDayPicker
                                initialRange={inputValueLocal as ObjectDateFilter}
                                setInitialValue={setInputValueLocal}
                                type={meta.mode ?? "single"}
                                onChange={handleRangeChange}
                                numberOfMonths={1}
                                className={stylesModules.smallCalendar}
                            />
                        )}

                        {meta?.type === "boolean" && (
                            <BooleanInput
                                value={inputValueLocal as BooleanFilter}
                                options={meta.booleanLabels ?? ["false", "true"]}
                                onChange={onChangeInput}
                                label={columnId}
                            />
                        )}

                        {meta?.type === "enum" && (
                            <EnumSelectInput
                                options={meta.options ?? []}
                                value={inputValueLocal as string}
                                onChange={onChangeInput}
                                label={columnId}
                            />
                        )}
                    </section>

                    <FadeButton
                        onClick={applyFilterInColumn}
                        icon={<Plus className={stylesModules.IconActionSection} />}
                        label="Apply"
                        typeOrderIcon="first"
                        disabled={isButtonAddFilterDisabled()}
                        classNameButton={stylesModules.applyButton}
                        classNameSpan={stylesModules.applySpan}
                    />
                    <FadeButton
                        onClick={handleOnClickCancelButton}
                        icon={<XCircle className={stylesModules.IconActionSection} />}
                        label="Cancel"
                        typeOrderIcon="first"
                        classNameButton={stylesModules.cancelButton}
                        classNameSpan={stylesModules.cancelSpan}
                    />

                    <div className={stylesModules.resetButtonContainer}>
                        <FadeButton
                            onClick={handleResetChanges}
                            label="Reset changes"
                            typeOrderIcon="first"
                            classNameButton={stylesModules.resetButton}
                            classNameSpan={stylesModules.resetSpan}
                            classNameLabel={stylesModules.resetLabel}
                            icon={<ChevronLeft className={stylesModules.IconActionSection} />}
                        />
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className={stylesModules.container}>
            <button
                className={stylesModules.optionIconButton}
                disabled={!isFilterable}
                ref={setReference}
                onClick={(e) => onClickFilter(e, column)}
                aria-label={`Toggle filter options for column ${columnId}`}
                type="button"
            >
                <MoreVertical className={stylesModules.optionIcon} />
            </button>

            {open && portalRoot.current && ReactDOM.createPortal(popoverContent, portalRoot.current)}
        </div>
    );
}

export default HeaderPopoverOptions;
