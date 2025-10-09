import type { ColumnDef, ColumnFiltersState, PaginationState, Row, RowModel, RowSelectionState, SortingState, Table, Updater, VisibilityState } from "@tanstack/react-table";
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { set_row_selection, set_sorting, set_column_visibility, set_column_filters, set_pagination } from "./tableActions"
import PopoverFloating from "../../../external/floating/pop-over/PopoverFloating";
import equalsBooleanFilter from "../filters/boolean/equalsBooleanFilter";
import betweenNumberFilter from "../filters/number/betweenNumberFilter";
import equalsNumberFilter from "../filters/number/equalsNumberFilter";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import startsWithFilter from "../filters/string/startsWithFilter";
import betweenDateFilter from "../filters/date/betweenDateFilter";
import equalsDateFilter from "../filters/date/equalsDateFilter";
import { useTableDispatch, useTableState } from "./tableHooks"
import formatDateToDMY from "../utils/formatDateToDMY";
import type { RowAction } from "./tableTypes";
import { Ellipsis } from "lucide-react";
import stylesModules from "./TableBase.module.css"
import GeneratorHeaderTable from "../components/generator-header-table/GeneratorHeaderTable";
import TableFooterControlsMemo from "../components/table-footer-controls/TableFooterControls";
import GeneratorBodyTableMemo from "../components/generator_body-table/GeneratorBodyTable";

interface TableBaseProps<T> {
    modelName: string;
    columns: ColumnDef<T>[];
    isLoadingData?: boolean;
    data: T[];
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
    const firstRenderRef = useRef(true);
    const memoData = useMemo(() => data, [data]);
    const baseColumns = useMemo(() => columns, [columns]);
    const memoGetRowId = useCallback(getRowId, [getRowId]);

    // todo: LOGICA PARA OPCIONES DE ROWS

    // const deleteRowsSelected = () => {
    //     const selectedIds = Object.keys(state.rowSelectionState).filter(
    //         (rowId) => state.rowSelectionState[rowId] === true
    //     );

    //     const selectedRows = data.filter((row, index) => {
    //         const rowId = getRowId(row, index);
    //         return selectedIds.includes(rowId);
    //     });

    //     onDeleteSelected(selectedRows);
    //     dispatch(clear_row_selection());
    // };

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
                    <CheckBoxTableMemo
                        className={stylesModules.checkboxHeader}
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <CheckBoxTableMemo
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

    /*  
        Efecto que permite retroalimentar al padre sobre cuando
        ocurrio una seleccion, y ejecutar una funcion enviada
        desde el padre(Este efecto no debe realizarse en el
        primer render)
    */
    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        // 1) IDs marcados como true en tu estado global
        const selectedIds = Object.entries(state.rowSelectionState)
            .filter(([, v]) => v)
            .map(([k]) => k);

        // 2) Mapa rápido id->row presente en la data actual
        const present = new Map<string, T>();
        for (let i = 0; i < memoData.length; i++) {
            present.set(memoGetRowId(memoData[i], i), memoData[i]);
        }

        // 3) Si la data actual NO contiene todos los seleccionados, NO notifiques.
        //    Esto evita "des-seleccionar" por el hecho de filtrar/paginar.
        const allVisible = selectedIds.every((id) => present.has(id));
        if (!allVisible) {
            return;
        }

        // 4) Arma el array de seleccionados y notifica
        const selected = selectedIds
            .map((id) => present.get(id))
            .filter((r): r is T => Boolean(r));

        onRowSelectionChangeExternal?.(selected);

        // 👇 deps: SOLO cambia cuando cambia la selección o la data
    }, [state.rowSelectionState, onRowSelectionChangeExternal, memoData, memoGetRowId]);


    // **** Declaracion de los classNames **** */

    const [
        containerClassNames, headerClassNames, containerMainClassNames,
        containerTableClassNames, tableClassNames, headerTableClassNames,
        bodyTableClassNames, footerclassNames
    ] = useMemo(() => {
        const containerClassNames =
            `${stylesModules.container} ${classNameGenericTableContainer} ` +
            `${extraComponents ? stylesModules.containerWithExtraComponents : stylesModules.containerWithoutExtraComponents} `;

        const headerClassNames = `${stylesModules.headerContainer} ${classNameExtraComponents} `;

        const containerMainClassNames = `${stylesModules.containerMain} ` +
            `${enablePagination || footerComponents ? stylesModules.containerMainWithFooterOrPagination : stylesModules.containerMainWithoutFooterOrPagination} ` +
            `${footerComponents && !enablePagination ? stylesModules.containerMainOnlyFooter : ""} `;

        const containerTableClassNames = `${stylesModules.containerTable} ${classNameTableContainer} ` +
            `${((footerComponents && !enablePagination) || (!enablePagination && !footerComponents)) ? stylesModules.containerTableBorderRadius : ""}`;

        const tableClassNames = `${stylesModules.table} ${classNameTable} ` +
            `${footerComponents ? stylesModules.tableWithoutFooter : ""}`;

        const headerTableClassNames = `${stylesModules.tableHeader} ${classNameTableHeader}`;

        const bodyTableClassNames = `${stylesModules.tableBody} ${classNameTableBody}`;

        const footerclassNames = `${stylesModules.footerComponentsContainer} ${classNameFooter}`;

        return [
            containerClassNames, headerClassNames, containerMainClassNames,
            containerTableClassNames, tableClassNames, headerTableClassNames,
            bodyTableClassNames, footerclassNames
        ];
    }, [
        extraComponents, enablePagination, footerComponents,
        classNameGenericTableContainer, classNameExtraComponents,
        classNameTableContainer, classNameTable,
        classNameTableHeader, classNameTableBody
    ]);

    const wrapperTableClassNames = useMemo(() => {
        const wrapperTableClassNames = `${(!(table?.getRowModel()?.rows?.length > 0) || isLoadingData) ? stylesModules.wrapperTableEmpty : stylesModules.wrapperTable}`;
        return wrapperTableClassNames;
    }, [table?.getRowModel()?.rows?.length, isLoadingData]);

    const rowModel: RowModel<T> = table.getRowModel();

    return (
        <div className={containerClassNames}>
            {extraComponents &&
                <div className={headerClassNames}>
                    <div className={`${stylesModules.extraComponentsContainer} `}>
                        {extraComponents(table)}
                    </div>
                </div>
            }
            <div className={containerMainClassNames}>
                <div className={containerTableClassNames}>
                    <div className={wrapperTableClassNames}>
                        <table className={tableClassNames}>
                            <GeneratorHeaderTable
                                table={table}
                                enableSorting={enableSorting}
                                enableFilters={enableFilters}
                                className={headerTableClassNames}
                                typeRowActions={typeRowActions}
                            />
                            <GeneratorBodyTableMemo
                                rowModel={rowModel}
                                table={table}
                                noResultsMessage={noResultsMessage}
                                enableRowEditClick={enableRowEditClick}
                                enableRowEditClickHandler={enableRowEditClickHandler}
                                className={bodyTableClassNames}
                                expandedComponent={expandedComponent}
                                isExpanded={isExpanded}
                                isHasFooter={footerComponents ? true : false}
                                isHasPagination={enablePagination}
                                isLoadingData={isLoadingData}
                            />
                        </table>
                    </div>
                </div>
                {(enablePagination || footerComponents) &&
                    <div className={stylesModules.containerOption}>
                        {
                            footerComponents &&
                            <div className={footerclassNames}>
                                {footerComponents(table)}
                            </div>
                        }
                        {
                            (table?.getRowModel()?.rows?.length >= 0 && enablePagination) && (
                                <TableFooterControlsMemo<T>
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
                    childrenTrigger={<TriggerButtonOptionsRow />}
                    childrenFloating={<PopoverContentOptionMemo rowActions={rowActions} row={row} />}
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
        <button className={stylesModules.optionsColumnButton}>
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


// * ********* Check Box table ********* */

interface CheckBoxTableProps {
    className?: string;
    type?: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckBoxTable = ({ className, type, checked, onChange }: CheckBoxTableProps) => {

    const handlerOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onChange?.(e);
    }

    return (
        <input
            className={className}
            type={type}
            checked={checked}
            onChange={handlerOnChange}
        />
    );
};

const CheckBoxTableMemo = memo(CheckBoxTable) as typeof CheckBoxTable;
