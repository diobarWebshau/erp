import {
    MoreVertical,
    ChevronDown,
    ChevronUp,
    XCircle,
    Check,
    Search,
    ChevronLeft,
    Plus
} from "lucide-react";
import StringInput
    from "../../gui/filter/string-input/StringInput";
import NumberSlice
    from "../../gui/filter/number-slicer/NumberSlicer";
import DateSlicer
    from "../../gui/filter/date-slicer/DateSlicer";
import BooleanInput
    from "../../gui/filter/boolean-input/BooleanInput";
import EnumSelectInput
    from "../../gui/filter/enum-input/EnumInput";
import type {
    Column,
    Header,
    Table
} from "@tanstack/react-table";
import {
    useEffect,
    useState,
    useCallback,
    type MouseEvent,
    type RefObject,
    useRef
} from "react";
import {
    createPortal
} from "react-dom";
import stylesModules
    from "./HeaderPopoverOptions.module.css";
import FadeButton
    from "../../gui/button/fade-button/FadeButton";
import type {
    DateRange
} from "react-day-picker";
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
    type BaseRow,
    type EnumFilter,
    type ObjectDateFilter,
    getDefaultResetValue
} from "../../../types";
import {
    useTableDispatch,
    useTableState
} from "../../../tableContext/tableHooks";
import {
    add_sorting,
    remove_column_filter,
    remove_sorting
} from "../../../tableContext/tableActions";


interface HeaderPopoverOptionsProps<T> {
    header: Header<T, unknown>,
    column: Column<T>,
    table: Table<T>,
    setIsVisibleFilterPopover: (
        isVisibleFilterPopover: string | null
    ) => void,
    filterTriggerRefs: React.MutableRefObject<
        Record<string, HTMLButtonElement | null>
    >,
    filterPopoverRef: RefObject<HTMLDivElement | null>,
    isVisibleFilterPopover: string | null;
    onClickFilter: (
        e: MouseEvent<HTMLButtonElement>,
        column: Column<T>
    ) => void,
    onClickAddFilter: (
        e: MouseEvent<HTMLButtonElement>,
        column: Column<T>,
        value: ColumnTypeDataFilter
    ) => void,
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


    const state =
        useTableState();
    const dispatch =
        useTableDispatch();

    /***********************
    *        States        *
    ***********************/

    // Estado para el estilo del popover
    const [popoverStyle, setPopoverStyle] =
        useState<React.CSSProperties>({});
    // Estado para saber si ya se midió y colocó el popover
    const [hasMeasured, setHasMeasured] =
        useState(false);
    // estado local para el valor del input
    const [inputValueLocal, setInputValueLocal] = useState<ColumnTypeDataFilter | undefined>(
        state.columnFiltersState
            .find((filter) => filter.id === column.id)
            ?.value as ColumnTypeDataFilter | undefined
    );

    // filterInputValues[column?.id]

    /************************
    *      Constants        *
    ************************/

    const meta = column.columnDef.meta;
    const columnId = column.id;
    const isFilterable = column.getFacetedRowModel().rows.length > 0;

    /***********************
    *      Functions       *
    ***********************/

    const onChangeInput = (value: ColumnTypeDataFilter) => {
        setInputValueLocal(value);
    }

    const applyFilterInColumn = (e: MouseEvent<HTMLButtonElement>) => {
        console.log("inputValueLocal", inputValueLocal);
        onClickAddFilter(e, column, inputValueLocal);
        onClickFilter(e, column);
    }

    const handleRangeChange = (rangeOrDate: DateRange | Date | undefined) => {
        if (!rangeOrDate) {
            console.log("Nada seleccionado");
            return;
        }

        if ("from" in rangeOrDate) {
            // Es un rango
            console.log("Rango seleccionado:", rangeOrDate);
            console.log(
                `Desde: ${rangeOrDate.from?.toISOString() ?? "n/a"} - Hasta: ${rangeOrDate.to?.toISOString() ?? "n/a"
                }`
            );
        } else if (rangeOrDate instanceof Date) {
            // Es una fecha única
            console.log("Fecha seleccionada:", rangeOrDate.toISOString());
        } else {
            console.log("Tipo desconocido:", rangeOrDate);
        }
    };

    const handleOnClickCancelButton = (e: MouseEvent<HTMLButtonElement>) => {
        setIsVisibleFilterPopover(null);
        setInputValueLocal(state.columnFiltersState.find(
            (filter) => filter.id === column.id
        )?.value as ColumnTypeDataFilter | undefined);
    }

    const handleResetChanges = () => {
        dispatch(remove_column_filter(column.id));
        dispatch(remove_sorting(column.id));
        setInputValueLocal(getDefaultResetValue(meta?.type as string));
    }

    const isButtonAddFilterDisabled = () => {
        let value: ColumnTypeDataFilter;
        switch (meta?.type) {
            case "boolean":
                value = inputValueLocal as BooleanFilter;
                return value === undefined;
            case "string":
                value = inputValueLocal as string[] || [];
                return value?.length === 0;
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
    }

    // Función que calcula y ajusta la posición del popover
    const updatePopoverPosition = useCallback(() => {
        const popoverEl = filterPopoverRef.current;
        const triggerEl = filterTriggerRefs.current[columnId];

        if (!popoverEl || !triggerEl) return;

        // Posicionamos fuera de pantalla para medir sin mostrar
        popoverEl.style.visibility = "hidden";
        popoverEl.style.display = "block";
        popoverEl.style.position = "fixed";
        popoverEl.style.top = "-9999px";
        popoverEl.style.left = "-9999px";

        // Medimos
        const triggerRect = triggerEl.getBoundingClientRect();
        const popoverRect = popoverEl.getBoundingClientRect();

        const spaceRight = window.innerWidth - triggerRect.right;
        const spaceLeft = triggerRect.left;

        let left: number | undefined = triggerRect.right;
        let right: number | undefined = undefined;

        if (popoverRect.width > spaceRight && popoverRect.width <= spaceLeft) {
            left = undefined;
            right = window.innerWidth - triggerRect.left;
        } else if (popoverRect.width > spaceRight && popoverRect.width > spaceLeft) {
            left = Math.min(triggerRect.left, window.innerWidth - popoverRect.width - 10);
            right = undefined;
        }

        setPopoverStyle({
            position: "fixed",
            top: triggerRect.bottom + window.scrollY,
            left,
            right,
            zIndex: 10000, // Asegúrate que sea mayor que el sticky header
            opacity: 1,
        });

        setHasMeasured(true);
    }, [filterPopoverRef, filterTriggerRefs, columnId]);

    /*********************
    *      Effects       *
    *********************/

    // useEffect para actualizar posición cuando isVisible cambie
    useEffect(() => {
        if (!(isVisibleFilterPopover === header.column.id)) {
            setHasMeasured(false);
            return;
        }
        // Actualizar posición inicialmente al abrir
        updatePopoverPosition();
    }, [
        isVisibleFilterPopover,
        updatePopoverPosition
    ]);

    useEffect(() => {
        if (!(isVisibleFilterPopover === header.column.id)) return;

        let ticking = false;

        const handleScrollResize = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updatePopoverPosition();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScrollResize); // fase burbuja
        window.addEventListener("resize", handleScrollResize);

        return () => {
            window.removeEventListener("scroll", handleScrollResize);
            window.removeEventListener("resize", handleScrollResize);
        };
    }, [
        isVisibleFilterPopover,
        updatePopoverPosition
    ]);

    useEffect(() => {
        if (isVisibleFilterPopover === column.id) {
            const globalValue = state.columnFiltersState.find(
                (filter) => filter.id === column.id
            )?.value as ColumnTypeDataFilter | undefined;

            setInputValueLocal(globalValue);
        }
    }, [
        isVisibleFilterPopover,
        column.id,
        state.columnFiltersState
    ]);

    /**********************************
    *      Internal Components        *
    **********************************/

    // Render del popover usando portal
    const popoverContent = (
        <div
            ref={filterPopoverRef}
            className={`${stylesModules.popoverOptions}`}
            style={{
                ...popoverStyle,
                visibility: hasMeasured ? "visible" : "hidden",
                pointerEvents: hasMeasured ? "auto" : "none",
                ...(hasMeasured
                    ? {}
                    : {
                        position: "fixed",
                        top: "-9999px",
                        left: "-9999px",
                    }),
            }}
        >
            {hasMeasured && (
                <>
                    <section className={`nunito-semibold ${stylesModules.sortSection}`}
                    >
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

                    <div className={stylesModules.separator}>
                    </div>

                    <section className={`nunito-semibold ${stylesModules.filterSection}`}>
                        {meta?.type === "string" && (
                            <CheckBoxWithSearch
                                options={table
                                    .getPreFilteredRowModel()
                                    .rows
                                    .map((row) => row.getValue(columnId))
                                    .filter((v): v is string => typeof v === "string")
                                    .filter((v, i, arr) => arr.indexOf(v) === i)
                                }
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
                                max={
                                    Math.max(
                                        ...table.getPreFilteredRowModel()
                                            .rows.map((row) => Number(row.getValue(columnId)))
                                            .filter((n) => !isNaN(n))

                                    )
                                }
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
                                // initialDate={new Date()}
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


    /***********************
    *      Render          *
    ***********************/

    return (
        <div className={stylesModules.container}>
            <button
                className={stylesModules.optionIconButton}
                disabled={!isFilterable}
                ref={(el) => {
                    if (el) filterTriggerRefs.current[columnId] = el;
                }}
                onClick={(e) => onClickFilter(e, column)}
                aria-label={`Toggle filter options for column ${columnId}`}
                type="button"
            >
                <MoreVertical className={stylesModules.optionIcon} />
            </button>

            {isVisibleFilterPopover === columnId && createPortal(popoverContent, document.body)}
        </div>
    );

}

export default HeaderPopoverOptions;
