import type { Table } from "@tanstack/react-table";
import PaginationControls from "../pagination-controls/PaginationControls";
import { useTableState } from "../../tableContext/tableHooks";
import StyleModule from "./TableFooterControls.module.css";
import { memo, useMemo } from "react";

interface TableFooterControlsProps<T> {
    table: Table<T>;
    className?: string;
    enableRowSelection?: boolean;
}

const TableFooterControls = <T,>({
    table,
    className = "",
    enableRowSelection = false,
}: TableFooterControlsProps<T>) => {

    const state = useTableState();

    const containerClassName = useMemo(() => {
        return `${StyleModule.container} ` +
            `${(enableRowSelection && Object.keys(state.rowSelectionState).length > 0)
                ? StyleModule.containerWithSelection
                : StyleModule.containerWithoutSelection} ` +
            `${className}`;
    }, [enableRowSelection, state.rowSelectionState, className]);

    return (
        <div className={containerClassName}>
            {enableRowSelection && Object.keys(state.rowSelectionState).length > 0 && (
                <div className={`nunito-regular ${StyleModule.infoContainer}`}>
                    <span>{`${Object.keys(state.rowSelectionState).length} registro(s) seleccionado(s)`}</span>
                </div>
            )}
            <div className={StyleModule.paginationContainer}>
                <PaginationControls table={table} className={StyleModule.paginationControls} />
            </div>
        </div>
    );
};

const TableFooterControlsMemo = memo(TableFooterControls) as typeof TableFooterControls;

export default TableFooterControlsMemo;
