import { useTableState } from "../../tableContext/tableHooks";
import type { Row, RowModel, Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import { useViewTransition } from "./useHookds";
import { Loader } from "@mantine/core";
import stylesModules from "./GeneratorBodyTable.module.css"
import useDraggableRow from "./../../tableContext/dnd-kit/useDraggableRow";


interface GeneratorBodyTableProps<T> {
    rowModel: RowModel<T>;
    table: Table<T>;
    noResultsMessage?: string;
    enableRowEditClick?: boolean;
    enableRowEditClickHandler?: (record: T) => void;
    className?: string;
    expandedComponent?: React.ReactNode;
    isExpanded?: boolean;
    isHasFooter?: boolean;
    isHasPagination?: boolean;
    isLoadingData?: boolean;
    enableSortableRows?: boolean;
}

const GeneratorBodyTable = <T,>({
    rowModel,
    table,
    noResultsMessage = "No results found",
    enableRowEditClick = false,
    enableRowEditClickHandler,
    expandedComponent,
    isExpanded = false,
    isHasFooter = false,
    isHasPagination = false,
    isLoadingData = false,
    enableSortableRows = false,
}: GeneratorBodyTableProps<T>) => {

    const state = useTableState();
    const tbodyClassName = useMemo(() => {
        const tbodyClassName: string = `${stylesModules.tableBody} ` +
            `${(isHasFooter || isHasPagination) ? stylesModules.tableBodyWithFooter : ""} `;
        return tbodyClassName;
    }, [isHasFooter, isHasPagination, state.columnFiltersState, state.sortingState, state.paginationState])

    return (
        <tbody className={tbodyClassName}>
            {
                isLoadingData ? (
                    <tr className={stylesModules.trTableEmpty}>
                        <td colSpan={table?.getAllColumns().length}>
                            <div className={stylesModules.containerLoading}>
                                <Loader size="lg" type="oval" color="var(--color-theme-primary)" />
                            </div>
                        </td>
                    </tr>
                ) : rowModel.rows.length > 0 ? (
                    rowModel.rows.map((row) => (
                        <RowComponentMemo
                            key={row.id}
                            row={row}
                            enableRowEditClick={enableRowEditClick}
                            enableRowEditClickHandler={enableRowEditClickHandler}
                            expandedComponent={expandedComponent}
                            isExpanded={isExpanded}
                            enableSortableRows={enableSortableRows}
                        />
                    ))
                ) : (
                    <tr className={stylesModules.trTableEmpty}>
                        <td className="nunito-regular" colSpan={table?.getAllColumns().length}>
                            {noResultsMessage}
                        </td>
                    </tr>
                )
            }
        </tbody >

    );
};

const GeneratorBodyTableMemo = memo(GeneratorBodyTable) as typeof GeneratorBodyTable;

export default GeneratorBodyTableMemo;


// *********** RowComponent *********** 

// *********** RowComponent *********** 

interface IRowComponent<T> {
    row: Row<T>;
    enableRowEditClick: boolean;
    enableRowEditClickHandler?: (row: T) => void;
    expandedComponent?: React.ReactNode;
    isExpandedComponent?: boolean;
    isExpanded?: boolean;
    enableSortableRows?: boolean;
}

const RowComponent = <T,>({
    row,
    enableRowEditClick,
    enableRowEditClickHandler,
    expandedComponent,
    isExpanded,
    enableSortableRows,
}: IRowComponent<T>) => {

    const state = useTableState();
    const [isExpandedRow, setIsExpandedRow] = useState<string>("");
    const { startViewTransition } = useViewTransition();

    // ⭐ Solo activar drag cuando enableSortableRows = true
    const draggable = enableSortableRows
        ? useDraggableRow(row)
        : { setNodeRef: undefined, attributes: {}, listeners: {}, style: undefined };

    const { setNodeRef, attributes, listeners, style } = draggable;

    const [classNameRow] = useMemo(() => {
        const classNameRow = `${stylesModules.trTableBody} ` +
            `${row.getIsSelected() ? stylesModules.rowSelected : ""} `;
        return [classNameRow];
    }, [row, state.rowSelectionState]);

    const handlerOnClickRow = useCallback((row: Row<T>) => {
        if (isExpandedRow === row.id) {
            startViewTransition(() => { setIsExpandedRow("") });
            return;
        }
        startViewTransition(() => { setIsExpandedRow(row.id) });
    }, [isExpandedRow, startViewTransition]);

    const createHandlerOnClickRow = useCallback((row: Row<T>) =>
        (e: React.MouseEvent<HTMLTableRowElement>) => {
            e.stopPropagation();
            if (enableRowEditClick && enableRowEditClickHandler) {
                return enableRowEditClickHandler(row.original)
            } else if (isExpanded) {
                return handlerOnClickRow(row)
            }
        },
        [enableRowEditClick, enableRowEditClickHandler, isExpanded, handlerOnClickRow]
    );

    return (
        <>
            <tr
                ref={setNodeRef}
                style={style}
                key={row.id}
                className={classNameRow}
                onClick={createHandlerOnClickRow(row)}
            >
                {row.getVisibleCells().map((cell) => {

                    const isDragCell = cell.column.id === "drag";

                    return (
                        <td
                            key={cell.id}
                            className={stylesModules.tdTableBody}
                            data-type={isDragCell ? "drag" : undefined}

                            // ⭐ Solo activamos listeners si sortable está habilitado
                            {...(enableSortableRows && isDragCell ? attributes : {})}
                            {...(enableSortableRows && isDragCell ? listeners : {})}
                            onClick={isDragCell ? (e) => e.stopPropagation() : undefined} // 👈 ESTA LINEA

                            style={
                                isDragCell && enableSortableRows
                                    ? { cursor: "grab" }
                                    : undefined
                            }
                        >
                            <div>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                        </td>
                    );
                })}
            </tr>

            {(enableRowEditClick === undefined || !enableRowEditClick)
                && (isExpanded && isExpandedRow === row.id) && (
                    <tr key={row.id + "-expanded"} className={classNameRow}>
                        <td colSpan={row.getVisibleCells().length}>
                            {expandedComponent}
                        </td>
                    </tr>
                )}
        </>
    );
};

const RowComponentMemo = memo(RowComponent) as typeof RowComponent;
