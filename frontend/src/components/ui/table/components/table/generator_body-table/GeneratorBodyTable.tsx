import {
    type Row,
    type Table,
    flexRender
} from "@tanstack/react-table";
import stylesModules
    from "./GeneratorBodyTable.module.css"
import { useState } from "react";
import { useViewTransition } from "./useHookds";

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
}

const GeneratorBodyTable = <T,>({
    table,
    noResultsMessage = "No results found",
    enableRowEditClick = false,
    enableRowEditClickHandler,
    className = "",
    expandedComponent,
    isExpanded = false,
    isHasFooter = false,
    isHasPagination = false,
}: GeneratorBodyTableProps<T>) => {

    const [isExpandedRow, setIsExpandedRow] =
        useState<string>("");

    const { startViewTransition } =
        useViewTransition();

    const handlerOnClickRow = (row: Row<T>) => {
        if (isExpandedRow === row.id) {
            startViewTransition(() => {
                setIsExpandedRow("")
            })
            return
        }
        // enableRowEditClickHandler && enableRowEditClickHandler(row.original)
        startViewTransition(() => {
            setIsExpandedRow(row.id)
        })
    };

    const handlerOnDoubleClickRow = (row: Row<T>) => {
        if (enableRowEditClick && enableRowEditClickHandler) {
            return enableRowEditClickHandler(row.original)
        } else if (isExpanded && isExpandedRow === row.id) {
            return handlerOnClickRow(row)
        } else {
            return
        }
    };

    return (
        <tbody className={`nunito-semibold 
            ${className} 
            ${stylesModules.tableBody}
            ${((isHasFooter && !isHasPagination) && (!isHasPagination && !isHasFooter)) ? stylesModules.tableBodyWithFooter : ""}
        `}
        >
            {
                table?.getRowModel().rows.length > 0 ? (
                    table?.getRowModel().rows.map((row) => (
                        <>
                            <tr
                                key={row.id}
                                className={
                                    `${stylesModules.trTableBody} ` +
                                    `${row.getIsSelected() ? stylesModules.rowSelected : ""}`
                                }
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlerOnDoubleClickRow(row)
                                }}
                                style={{
                                    cursor: enableRowEditClick ? "pointer" : "default"
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
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
                                    >
                                        <td colSpan={row.getVisibleCells().length}>
                                            {expandedComponent}
                                        </td>
                                    </tr>
                                )}
                        </>
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

export default GeneratorBodyTable;
