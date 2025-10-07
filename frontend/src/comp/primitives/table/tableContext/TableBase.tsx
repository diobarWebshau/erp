import { useTableDispatch, useTableState } from "./tableHooks"
import { set_row_selection, set_sorting, clear_row_selection, set_column_visibility, set_column_filters, set_pagination } from "./tableActions"
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef, ColumnFiltersState, PaginationState, Row, RowSelectionState, SortingState, Table, Updater, VisibilityState } from "@tanstack/react-table";
import type { RowAction } from "./tableTypes";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Ellipsis } from "lucide-react";
import formatDateToDMY from "../utils/formatDateToDMY";
import startsWithFilter from "../filters/string/startsWithFilter";
import betweenNumberFilter from "../filters/number/betweenNumberFilter";
import equalsNumberFilter from "../filters/number/equalsNumberFilter";
import betweenDateFilter from "../filters/date/betweenDateFilter";
import equalsDateFilter from "../filters/date/equalsDateFilter";
import equalsBooleanFilter from "../filters/boolean/equalsBooleanFilter";
import GeneratorBodyTable from "../components/generator_body-table/GeneratorBodyTable";
import TableFooterControls from "../components/table-footer-controls/TableFooterControls";
import GeneratorHeaderTable from "../components/generator-header-table/GeneratorHeaderTable";
import stylesModules from "./TableBase.module.css"
import PopoverFloating from "../../../external/floating/pop-over/PopoverFloating";

interface TableBaseProps<T> {
    modelName: string;
    columns: ColumnDef<T>[];
    isLoadingData?: boolean;
    data: T[];
    onDeleteSelected: (datas: T[]) => void;
    typeRowActions?: "ellipsis" | "icon";
    rowActions?: RowAction<T>[];
    enableFilters?: boolean;
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    enableOptionsColumn?: boolean;
    enableRowEditClick?: boolean;
    onRowSelectionChangeExternal?: (selected: T[]) => void;
    enableRowEditClickHandler?: (record: T) => void;
    conditionalRowSelection?: (updater: RowSelectionState, rows: Row<T>[]) => boolean;
    noResultsMessage?: string;
    extraComponents?: (table?: Table<T>) => React.ReactNode;
    footerComponents?: (table: Table<T>) => React.ReactNode;
    classNameGenericTableContainer?: string;
    classNameExtraComponents?: string;
    classNameTableContainer?: string;
    classNameTable?: string;
    classNameTableHeader?: string,
    classNameTableBody?: string,
    classNameFooter?: string;
    classNamePagination?: string;
    expandedComponent?: React.ReactNode;
    isExpanded?: boolean;
    getRowId: (row: T, index: number) => string;
}

const TableBase = <T,>({
    columns,
    isLoadingData,
    data,
    onDeleteSelected,
    rowActions,
    typeRowActions = "ellipsis",
    enableFilters = false,
    enableSorting = false,
    enablePagination = false,
    enableRowSelection = false,
    enableOptionsColumn = false,
    noResultsMessage = "No results.",
    enableRowEditClick = false,
    conditionalRowSelection,
    onRowSelectionChangeExternal,
    enableRowEditClickHandler,
    extraComponents,
    footerComponents,
    classNameGenericTableContainer,
    classNameExtraComponents,
    classNameTableContainer,
    classNameTable,
    classNameTableHeader,
    classNameTableBody,
    classNameFooter,
    classNamePagination,
    expandedComponent,
    isExpanded,
    getRowId = (_, index) => `temp-${index}`,
}: TableBaseProps<T>) => {

    const dispatch = useTableDispatch();
    const state = useTableState();
    const memoData = useMemo(() => data, [data]);
    const memoGetRowId = useCallback(getRowId, [getRowId]);
    const baseColumns = useMemo(() => columns, [columns]);
    const firstRenderRef = useRef(true);

    // todo: LOGICA PARA OPCIONES DE ROWS

    const deleteRowsSelected = () => {
        const selectedIds = Object.keys(state.rowSelectionState).filter(
            (rowId) => state.rowSelectionState[rowId] === true
        );

        const selectedRows = data.filter((row, index) => {
            const rowId = getRowId(row, index);
            return selectedIds.includes(rowId);
        });

        onDeleteSelected(selectedRows);
        dispatch(clear_row_selection());
    };

    // * ********* Preprocesamiento de las columnas ********* */

    const memoProcessedColumns = useMemo(() => {
        // 1) Parte base
        let cols = baseColumns;

        // 2) Asignar filterFn según meta (usa tu switch actual aquí, inline)
        cols = cols.map(col => {
            switch (col.meta?.type) {
                case "string": return { ...col, filterFn: startsWithFilter };
                case "number":
                    return col.meta?.mode === "range"
                        ? { ...col, filterFn: betweenNumberFilter }
                        : { ...col, filterFn: equalsNumberFilter };
                case "date":
                    return col.meta?.mode === "range"
                        ? { ...col, filterFn: betweenDateFilter }
                        : { ...col, filterFn: equalsDateFilter };
                case "boolean": return { ...col, filterFn: equalsBooleanFilter };
                case "enum": return { ...col, filterFn: startsWithFilter };
                default: return col;
            }
        });

        // 3) Formateo de celdas de fecha
        cols = cols.map(col => (
            col.meta?.type === "date"
                ? { ...col, cell: ({ getValue }) => formatDateToDMY(getValue() as string | Date) }
                : col
        ));

        // 4) Insertar selección y opciones si aplica
        const parts: ColumnDef<T>[] = [];

        // 5) Insertar columna de selección si aplica
        if (enableRowSelection) {
            parts.push({
                id: "select",
                header: ({ table }) => (
                    <input
                        className={stylesModules.checkboxHeader}
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <input
                        className={stylesModules.checkbox}
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: { autoGenerated: true, isMetaColumn: true },
            } as ColumnDef<T>);
        }

        parts.push(...cols);

        // 6) Insertar columna de opciones si aplica
        if (enableOptionsColumn) {
            parts.push({
                id: "options",
                header: typeRowActions === "icon" ? "Acciones" : () => null,
                cell: ({ row }) => (
                    <OptionsRowMemo
                        typeRowActions={typeRowActions}
                        rowActions={rowActions as RowAction<T>[]} // TODO: arreglar
                        row={row}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: { autoGenerated: false, isMetaColumn: true },
            } as ColumnDef<T>);
        }
        return parts;
    }, [
        baseColumns,
        enableRowSelection,
        enableOptionsColumn,
        typeRowActions,
        rowActions,                // pide al padre memoizarlo si es array nuevo cada render
    ]);

    // ****** Obtener columnas visibles ******

    const initialStateVisibilityColumns = useMemo(() => {
        const visibilityState: Record<string, boolean> = Object.fromEntries(
            columns.map((col) => {
                const key =
                    'id' in col && col.id
                        ? col.id
                        : 'accessorKey' in col && col.accessorKey
                            ? String(col.accessorKey)
                            : ''; // fallback si no tiene ni id ni accessorKey

                return [key, !col.meta?.hidden];
            }).filter(([key]) => key !== '') // eliminamos columnas sin clave
        );
        return visibilityState;
    }, [columns]);

    const mergedVisibilityColumns = useMemo(() => {
        const out: Record<string, boolean> = {};
        for (const [key, defVisible] of Object.entries(initialStateVisibilityColumns)) {
            out[key] = key in state.columnVisibilityState
                ? state.columnVisibilityState[key]
                : defVisible;
        }
        return out;
    }, [initialStateVisibilityColumns, state.columnVisibilityState]);


    // ****** Handlers de la tabla ******

    const onRowSelectionChange = useCallback((updater: Updater<RowSelectionState>) => {
        const next = typeof updater === "function" ? updater(state.rowSelectionState) : updater;

        const ok = conditionalRowSelection ? conditionalRowSelection(next, table.getRowModel().rows) : true;
        if (ok) dispatch(set_row_selection(next));
    }, [dispatch, state.rowSelectionState, conditionalRowSelection /* no pongas table aquí */]);

    const onColumnVisibilityChange = useCallback((updater: Updater<VisibilityState>) => {
        const next = typeof updater === "function" ? updater(state.columnVisibilityState) : updater;
        dispatch(set_column_visibility(next));
    }, [dispatch, state.columnVisibilityState]);

    const onSortingChange = useCallback((updater: Updater<SortingState>) => {
        const next = typeof updater === "function" ? updater(state.sortingState) : updater;
        dispatch(set_sorting(next));
    }, [dispatch, state.sortingState]);

    const onColumnFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
        const next = typeof updater === "function" ? updater(state.columnFiltersState) : updater;
        dispatch(set_column_filters(next));
    }, [dispatch, state.columnFiltersState]);

    const onPaginationChange = useCallback((updater: Updater<PaginationState>) => {
        const next = typeof updater === "function" ? updater(state.paginationState) : updater;
        dispatch(set_pagination(next));
    }, [dispatch, state.paginationState]);

    // ****** Inicializacion de la tabla ******


    const table: Table<T> = useReactTable({

        // ? props base de la tabla
        data: memoData,
        columns: memoProcessedColumns,
        getRowId: memoGetRowId,
        getCoreRowModel: getCoreRowModel(),


        // ? Modelos de la tabla segun se requieran
        ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
        ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
        ...(enableFilters ? { getFilteredRowModel: getFilteredRowModel() } : {}),
        ...(isExpanded ? { getExpandedRowModel: getExpandedRowModel() } : {}),

        // ? Hanlder onChange de la tabla(Visibilidad, filtros, sorts, paginacion y seleccion de filas)
        ...(enableRowSelection && { onRowSelectionChange: onRowSelectionChange }),
    onColumnVisibilityChange: onColumnVisibilityChange,
        ...(enableSorting && { onSortingChange: onSortingChange }),
        ...(enableFilters && { onColumnFiltersChange: onColumnFiltersChange }),
        ...(enablePagination && { onPaginationChange: onPaginationChange }),


    // ? Estado inicial de la tabla establecida por el estado global(Context Provider)
    state: {
            ...(enableRowSelection ? { rowSelection: state.rowSelectionState } : {}),
        columnVisibility: mergedVisibilityColumns,
            ...(enableFilters ? { columnFilters: state.columnFiltersState } : {}),
            ...(enablePagination ? { pagination: state.paginationState } : {}),
            ...(enableSorting ? { sorting: state.sortingState } : {}),
            // ...(isExpanded ? { expanded: state.expandedState } : {}),
        },
    });

// * ********* Efectos ********* */

// ? Efecto que permite retroalimentar al padre sobre cuando ocurrio una seleccion, y ejecutar una funcion enviada desde el padre(Este efecto no debe realizarse en el primer render)
useEffect(() => {
    if (firstRenderRef.current) { // Si es el primer render, no efectuar el metodo del onSelected del padre
        console.log(`firstRenderRef.current:`, firstRenderRef.current);
        firstRenderRef.current = false;
        return;
    }
    const selected = table.getPreFilteredRowModel()
        .rows.filter(r => r.getIsSelected()).map(r => r.original);
    onRowSelectionChangeExternal?.(selected);
}, [state.rowSelectionState, onRowSelectionChangeExternal, memoData.length]);
// useEffect(() => {
//     if (firstRenderRef.current) { // Si es el primer render, no efectuar el metodo del onSelected del padre
//         firstRenderRef.current = false;
//         return;
//     }
//     if (!memoData.length) return;            // espera a que haya data
//     const selected = table.getPreFilteredRowModel().rows
//         .filter(r => r.getIsSelected())
//         .map(r => r.original);
//     onRowSelectionChangeExternal?.(selected);
// }, [state.rowSelectionState, memoData.length]);


// useEffect(() => {
//     const next = { ...initialStateVisibilityColumns };
//     dispatch(set_column_visibility(next));
// }, [initialStateVisibilityColumns])


return (
    < div
        className={
            `${stylesModules.container} ${classNameGenericTableContainer} ` +
            `${extraComponents ? stylesModules.containerWithExtraComponents : stylesModules.containerWithoutExtraComponents}`
        }
    >
        {
            extraComponents &&
            <div
                className={`${stylesModules.headerContainer} ${classNameExtraComponents}`}
            >
                {(
                    <div
                        className={`${stylesModules.extraComponentsContainer} `}
                    >
                        {extraComponents(table)}
                    </div>
                )}
            </div>
        }
        <div
            className={
                ` ${stylesModules.containerMain} ` +
                `${enablePagination || footerComponents
                    ? stylesModules.containerMainWithFooterOrPagination
                    : stylesModules.containerMainWithoutFooterOrPagination} ` +
                `${footerComponents && stylesModules.containerMainOnlyFooter}`
            }
        >
            <div
                className={
                    `${stylesModules.containerTable} ${classNameTableContainer} ` +
                    `${((footerComponents && !enablePagination) || (!enablePagination && !footerComponents)) ? stylesModules.containerTableBorderRadius : ""}`
                }
            >
                {table?.getRowModel()?.rows?.length > 0 ? (
                    <div className={stylesModules.wrapperTable}>
                        <table
                            className={
                                `${stylesModules.table} ${classNameTable} ` +
                                `${footerComponents ? stylesModules.tableWithoutFooter : ""}`
                            }
                        >
                            {
                                table?.getRowModel()?.rows?.length >= 0 && (
                                    <GeneratorHeaderTable
                                        table={table}
                                        enableSorting={enableSorting}
                                        enableFilters={enableFilters}
                                        className={`${stylesModules.tableHeader} ${classNameTableHeader}`}
                                        typeRowActions={typeRowActions}
                                    />
                                )}
                            {
                                table?.getRowModel()?.rows?.length >= 0 && (
                                    <GeneratorBodyTable
                                        table={table}
                                        noResultsMessage={noResultsMessage}
                                        enableRowEditClick={enableRowEditClick}
                                        enableRowEditClickHandler={enableRowEditClickHandler}
                                        className={`${stylesModules.tableBody} ${classNameTableBody}`}
                                        expandedComponent={expandedComponent}
                                        isExpanded={isExpanded}
                                        isHasFooter={footerComponents ? true : false}
                                        isHasPagination={enablePagination}
                                        isLoadingData={isLoadingData}
                                    />
                                )
                            }
                        </table>
                    </div>

                ) : (
                    <table
                        className={
                            `${stylesModules.table}  ${classNameTable} ` +
                            `${footerComponents ? stylesModules.tableWithoutFooter : ""}`
                        }
                    >
                        {
                            table?.getRowModel()?.rows?.length >= 0 && (
                                <GeneratorHeaderTable
                                    table={table}
                                    enableSorting={enableSorting}
                                    enableFilters={enableFilters}
                                    className={`${stylesModules.tableHeader} ${classNameTableHeader}`}
                                    typeRowActions={typeRowActions}
                                />
                            )}
                        {
                            table?.getRowModel()?.rows?.length >= 0 && (
                                <GeneratorBodyTable
                                    table={table}
                                    noResultsMessage={noResultsMessage}
                                    enableRowEditClick={enableRowEditClick}
                                    enableRowEditClickHandler={enableRowEditClickHandler}
                                    className={`${stylesModules.tableBody} ${classNameTableBody}`}
                                    expandedComponent={expandedComponent}
                                    isExpanded={isExpanded}
                                    isHasPagination={footerComponents ? true : false}
                                    isHasFooter={enablePagination}
                                    isLoadingData={isLoadingData}
                                />
                            )
                        }
                    </table>
                )}
            </div>
            {(enablePagination || footerComponents) &&
                <div className={`${stylesModules.containerOption}`}
                >
                    {
                        footerComponents && (
                            <div
                                className={`${stylesModules.footerComponentsContainer} ${classNameFooter}`}
                            >
                                {footerComponents(table)}
                            </div>
                        )
                    }
                    {
                        table?.getRowModel()?.rows?.length >= 0 &&
                        enablePagination && (
                            <TableFooterControls<T>
                                deleteRowsSelected={deleteRowsSelected}
                                table={table}
                                className={`${stylesModules.containerPagination} ${classNamePagination}`}
                                enableRowSelection={enableRowSelection}
                            />
                        )
                    }
                </div>
            }
        </div>
    </div >
)
}

const TableBaseMemo = memo(TableBase) as typeof TableBase;

export default TableBaseMemo;

// *************************  OptionsRow ******************************

interface OptionsRowProps<T> {
    typeRowActions: "icon" | "ellipsis";
    rowActions: RowAction<T>[];
    row: Row<T>;
}

const OptionsRow = <T,>({
    typeRowActions,
    rowActions,
    row,
}: OptionsRowProps<T>) => {

    return (
        <div className={stylesModules.optionsColumnContainer}>
            {typeRowActions === "ellipsis" ? (
                <PopoverFloating
                    placement="bottom"
                    childrenTrigger={
                        <TriggerButtonOptionsRow />
                    }
                    childrenFloating={
                        <PopoverContentOptionMemo rowActions={rowActions} row={row} />
                    }
                />
            ) : (
                <div className={stylesModules.optionsColumn}>
                    {rowActions?.map((a, i) => (
                        <button
                            className={stylesModules.optionsColumnButton}
                            type="button"
                            key={i}
                            onClick={(e) => { e.stopPropagation(); a.onClick(row.original); }}
                            disabled={a.disabled ? a.disabled(row.original) : false}
                        >
                            {a.icon}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const OptionsRowMemo = memo(OptionsRow) as typeof OptionsRow;


// ? ****** Componentes auxliares de OptionsRow ******

const TriggerButtonOptionsRow = () => {
    return (
        <button
            className={stylesModules.optionsColumnButton}
        >
            <Ellipsis size={15} />
        </button>
    );
};

interface PopoverContentOptionProps<T> {
    rowActions: RowAction<T>[];
    row: Row<T>;
}

const PopoverContentOption = <T,>({
    rowActions,
    row,
}: PopoverContentOptionProps<T>) => {
    return (
        <div>
            {rowActions?.map((a, i) => (
                <button
                    className={stylesModules.optionsColumnButton}
                    type="button"
                    key={i}
                    onClick={(e) => { e.stopPropagation(); a.onClick(row.original); }}
                    disabled={a.disabled ? a.disabled(row.original) : false}
                >
                    {a.icon}
                </button>
            ))}
        </div>
    );
};

const PopoverContentOptionMemo = memo(PopoverContentOption) as typeof PopoverContentOption;

