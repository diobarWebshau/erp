import type { Row, Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import stylesModules from "./GeneratorBodyTable.module.css"
import { memo, useCallback, useMemo, useState } from "react";
import { useViewTransition } from "./useHookds";
import { Loader } from "@mantine/core";

interface GeneratorBodyTableProps<T> {
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
}

const GeneratorBodyTable = <T,>({
    table,
    noResultsMessage = "No results found",
    enableRowEditClick = false,
    enableRowEditClickHandler,
    expandedComponent,
    isExpanded = false,
    isHasFooter = false,
    isHasPagination = false,
    isLoadingData = false,
}: GeneratorBodyTableProps<T>) => {

    const tbodyClassName = useMemo(() => {
        const tbodyClassName: string = `${stylesModules.tableBody} ` +
            `${(isHasFooter || isHasPagination) ? stylesModules.tableBodyWithFooter : ""} `;
        return tbodyClassName;
    }, [isHasFooter, isHasPagination])

    return (
        <tbody className={tbodyClassName}>
            {
                isLoadingData ? (
                    <tr className={stylesModules.trTableEmpty}>
                        <td colSpan={table?.getAllColumns().length} className={stylesModules.sd}>
                            <Loader
                                size={24}
                                className="nunito-bold"
                            />
                        </td>
                    </tr>
                ) : table?.getRowModel().rows.length > 0 ? (
                    table?.getRowModel().rows.map((row) => (
                        <RowComponentMemo
                            key={row.id}
                            row={row}
                            enableRowEditClick={enableRowEditClick}
                            enableRowEditClickHandler={enableRowEditClickHandler}
                            expandedComponent={expandedComponent}
                            isExpanded={isExpanded}
                        />
                    ))
                ) : (
                    <tr
                        className={stylesModules.trTableEmpty}
                    >
                        <td
                            className="nunito-regular"
                            colSpan={table?.getAllColumns().length}>
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

interface IRowComponent<T> {
    row: Row<T>;
    enableRowEditClick: boolean;
    enableRowEditClickHandler?: (row: T) => void;
    expandedComponent?: React.ReactNode;
    isExpandedComponent?: boolean;
    isExpanded?: boolean;
}

const RowComponent = <T,>({
    row,
    enableRowEditClick,
    enableRowEditClickHandler,
    expandedComponent,
    isExpanded,
}: IRowComponent<T>) => {

    const [isExpandedRow, setIsExpandedRow] = useState<string>("");

    const { startViewTransition } = useViewTransition();

    const [classNameRow] = useMemo(() => {
        const classNameRow = `${stylesModules.trTableBody} ` +
            `${row.getIsSelected() ? stylesModules.rowSelected : ""} `;
        return [classNameRow];
    }, [row])

    const handlerOnClickRow = useCallback((row: Row<T>) => {
        if (isExpandedRow === row.id) {
            startViewTransition(() => { setIsExpandedRow("") })
            return;
        }
        startViewTransition(() => { setIsExpandedRow(row.id) })
    }, [isExpandedRow, startViewTransition]);

    const createHandlerOnClickRow = useCallback((row: Row<T>) => (e: React.MouseEvent<HTMLTableRowElement>) => {
        e.stopPropagation()
        if (enableRowEditClick && enableRowEditClickHandler) {
            return enableRowEditClickHandler(row.original)
        } else if (isExpanded) {
            return handlerOnClickRow(row)
        } else {
            return
        }
    }, [enableRowEditClick, enableRowEditClickHandler, isExpanded, handlerOnClickRow])

    return (
        <>
            <tr
                key={row.id}
                className={classNameRow}
                onClick={createHandlerOnClickRow(row)}
            >
                {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}
                        className={stylesModules.tdTableBody}
                    >
                        <div>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                        </div>
                    </td>
                ))}
            </tr>
            {(enableRowEditClick === undefined || !enableRowEditClick)
                && (isExpanded && isExpandedRow === row.id) && (
                    <tr key={row.id + "-expanded"}
                        className={classNameRow}
                    >
                        <td colSpan={row.getVisibleCells().length}>
                            {expandedComponent}
                        </td>
                    </tr>
                )}
        </>
    )
}

const RowComponentMemo = memo(RowComponent) as typeof RowComponent;
