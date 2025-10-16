import type { ColumnDef, ColumnFiltersState, PaginationState, Row, RowModel, RowSelectionState, SortingState, Table, Updater, VisibilityState } from "@tanstack/react-table";
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { set_row_selection, set_sorting, set_column_visibility, set_column_filters, set_pagination } from "./tableActions"
import PopoverFloating from "../../../external/floating/pop-over/PopoverFloating";
import equalsBooleanFilter from "../filters/boolean/equalsBooleanFilter";
import betweenNumberFilter from "../filters/number/betweenNumberFilter";
import equalsNumberFilter from "../filters/number/equalsNumberFilter";
import { memo, useCallback, useEffect, useMemo, useRef, type Dispatch } from "react";
import startsWithFilter from "../filters/string/startsWithFilter";
import betweenDateFilter from "../filters/date/betweenDateFilter";
import equalsDateFilter from "../filters/date/equalsDateFilter";
import { useTableDispatch, useTableState } from "./tableHooks"
import formatDateToDMY from "../utils/formatDateToDMY";
import type { RowAction, TableAction, TableState } from "./tableTypes";
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
    extraComponents?: ({ table, state, dispatch }: { table: Table<T>, state: TableState, dispatch: Dispatch<TableAction> }) => React.ReactNode;
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
                    <CheckBoxHeaderTableMemo
                        className={stylesModules.checkboxHeader}
                        table={table}
                        condition={conditionalRowSelection ?? null}
                        state={table.getState().rowSelection}
                    />
                ),
                cell: ({ row }) => (
                    <CheckBoxBodyTableMemo
                        className={stylesModules.checkbox}
                        row={row}
                        state={table.getState().rowSelection}
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
        if (ok) {
            dispatch(set_row_selection(next));
            // confirmChangesExternal();
        }
    }, [dispatch, state.rowSelectionState, conditionalRowSelection]);

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
    }, [state.rowSelectionState, memoData, memoGetRowId, onRowSelectionChangeExternal]);



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
        extraComponents, footerComponents,
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
                        {extraComponents({ table, state, dispatch })}
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

type IconOptionRowProps<T> = {
    action: RowAction<T>;
    row: Row<T>;
    index: number;
};

const IconOptionRow = <T,>({ action, row }: IconOptionRowProps<T>) => {
    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        action.onClick(row.original);
    };

    const disabled = typeof action.disabled === "function"
        ? action.disabled(row.original)
        : !!action.disabled;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={stylesModules?.optionsColumnButton}
            title={action.label}
            aria-label={action.label}
        >
            {action.icon}
        </button>
    );
};

const IconOptionRowMemo = memo(IconOptionRow) as typeof IconOptionRow;

const OptionsRow = <T,>({
    typeRowActions,
    rowActions,
    row,
}: {
    typeRowActions: "icon" | "ellipsis";
    rowActions: RowAction<T>[];
    row: Row<T>;
}) => {
    const rowActionsMemo = useMemo(() => rowActions, [rowActions]);

    return (
        <div className={stylesModules.optionsColumnContainer}>
            {typeRowActions === "ellipsis" ? (
                <PopoverFloating
                    placement="bottom"
                    childrenTrigger={<TriggerButtonOptionsRow />}
                    childrenFloating={<PopoverContentOptionMemo rowActions={rowActions} row={row} />}
                />
            ) : (
                rowActionsMemo?.map((action, index) => {
                    const passes =
                        typeof action.condition === "function"
                            ? action.condition(row.original)
                            : action.condition ?? true;

                    if (!passes) return null;
                    return (
                        <IconOptionRowMemo
                            key={index}
                            action={action}
                            row={row}
                            index={index}
                        />
                    );
                })
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


// -----------------------------------------------------------
//  Checkbox del encabezado de la tabla (seleccionar/deseleccionar todos)
//  Incluye soporte para "estado indeterminado" (cuando solo algunas filas
//  están seleccionadas) y valida con la condición `conditionalRowSelection`.
// -----------------------------------------------------------

interface CheckBoxHeaderTableProps<T> {
    className?: string;
    table: Table<T>;
    /** Si regresa false, se cancela la selección masiva */
    condition: ((updater: RowSelectionState, rows: Row<T>[]) => boolean) | null;
    state?: RowSelectionState;
}

const CheckBoxHeaderTable = <T,>({
    className,
    table,
    condition,
    state,
}: CheckBoxHeaderTableProps<T>) => {
    // Referencia al input checkbox del header, para controlar
    // manualmente su estado "indeterminate".
    const inputRef = useRef<HTMLInputElement>(null);

    //  Este efecto actualiza el estado visual del checkbox
    // cuando algunas filas están seleccionadas (indeterminate).
    useEffect(() => {
        if (!inputRef.current) return;
        const some = table.getIsSomePageRowsSelected(); // hay algunas seleccionadas
        const all = table.getIsAllPageRowsSelected();   // todas seleccionadas
        inputRef.current.indeterminate = some && !all;  // estado visual intermedio
    }, [table, state]);

    //  Evento que se ejecuta al hacer clic en el checkbox del header.
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation(); // evita que el clic burbujee a la fila

        // Obtiene todas las filas visibles (página actual)
        const pageRows = table.getRowModel().rows;

        // Determina si el clic actual intenta seleccionar o deseleccionar todo.
        const willSelectAll = !table.getIsAllPageRowsSelected();

        // Simula el "estado siguiente" de selección para validarlo
        const next: RowSelectionState = { ...table.getState().rowSelection };
        if (willSelectAll) {
            // Si se intenta seleccionar todo, marcamos todas las filas visibles
            for (const r of pageRows) next[r.id] = true;
        } else {
            // Si se intenta deseleccionar todo, las removemos
            for (const r of pageRows) delete next[r.id];
        }

        // Si existe una condición personalizada, la evaluamos
        if (condition && !condition(next, pageRows)) {
            //  No se cumple la condición → revertimos el cambio visual
            e.preventDefault();

            // Re-sincronizamos el estado visual (checked e indeterminate)
            if (inputRef.current) {
                const some = table.getIsSomePageRowsSelected();
                const all = table.getIsAllPageRowsSelected();
                inputRef.current.checked = all;
                inputRef.current.indeterminate = some && !all;
            }
            return; // no aplicar selección
        }

        //  Si la condición se cumple, aplicamos el cambio en TanStack
        table.toggleAllPageRowsSelected(willSelectAll);
    };

    return (
        <input
            ref={inputRef}
            className={className}
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={onChange}
        />
    );
};

// Memoriza el componente para evitar renders innecesarios
const CheckBoxHeaderTableMemo = memo(CheckBoxHeaderTable) as typeof CheckBoxHeaderTable;


// -----------------------------------------------------------
//  Checkbox individual de cada fila de la tabla.
//  Aplica validación condicional antes de alternar la selección.
// -----------------------------------------------------------

interface CheckBoxBodyTableProps<T> {
    className?: string;
    row: Row<T>;
    table?: Table<T>; // Se usa para acceder a todas las filas visibles
    /** Si regresa false, se cancela el toggle de esta fila */
    condition?: (updater: RowSelectionState, rows: Row<T>[]) => boolean;
    state?: RowSelectionState;
}

const CheckBoxBodyTable = <T,>({
    className,
    row,
    table,
    condition,
    state
}: CheckBoxBodyTableProps<T>) => {
    // 👇 Evento al cambiar el estado del checkbox
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation(); // evita afectar otros clics de la fila

        // Si hay condición definida y tenemos acceso a la tabla
        if (table && condition) {
            const rows = table.getRowModel().rows;

            // Simula el estado de selección si esta fila cambiara
            const next: RowSelectionState = { ...table.getState().rowSelection };
            const willSelect = !row.getIsSelected();
            if (willSelect) next[row.id] = true;
            else delete next[row.id];

            // Si la condición no se cumple, cancelamos el cambio
            if (!condition(next, rows)) {
                e.preventDefault();
                return;
            }
        }

        // ✅ Si la condición se cumple, aplicamos el cambio a TanStack
        row.getToggleSelectedHandler()(e);
    };

    useEffect(() => {
        if (state) {
            row.toggleSelected(state[row.id] ?? false);
        }
    }, [state]);

    return (
        <input
            className={className}
            type="checkbox"
            checked={row.getIsSelected()}     // estado real de la fila
            onChange={onChange}               // handler personalizado con validación
            onClick={(e) => e.stopPropagation()} // evita abrir detalles de la fila
        />
    );
};

// Memoriza el componente para evitar renders innecesarios
const CheckBoxBodyTableMemo = memo(CheckBoxBodyTable) as typeof CheckBoxBodyTable;
