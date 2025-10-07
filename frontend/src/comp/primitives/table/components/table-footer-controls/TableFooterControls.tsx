import type {
    Table
} from "@tanstack/react-table";
import PaginationControls
    from "../pagination-controls/PaginationControls";
import StyleModule
    from "./TableFooterControls.module.css";
import FadeButton
    from "../../../button/fade-button/FadeButton";
import {
    useTableDispatch,
    useTableState
} from "../../tableContext/tableHooks";

interface TableFooterControlsProps<T> {
    deleteRowsSelected: () => void;
    table: Table<T>;
    className?: string;
    enableRowSelection?: boolean;
}

const TableFooterControls = <T,>({
    deleteRowsSelected,
    table,
    className = "",
    enableRowSelection = false,
}: TableFooterControlsProps<T>) => {

    const state = useTableState();
    const dispatch = useTableDispatch();

    return (
        <div
            className={`nunito-regular ${StyleModule.container} ${className}`}
            style={{
                // justifyContent: enableRowSelection ? "end" : "flex-end",
                justifyContent: "flex-end",
            }}
        >
            {/* {enableRowSelection && (
                <div
                    className={StyleModule.selectRowsSection}
                >
                    <span>{`${Object.keys(state.rowSelectionState).length} rows selected`}</span>
                    {Object.keys(state.rowSelectionState).length > 0 && (
                        <FadeButton
                            onClick={deleteRowsSelected}
                            label="Delete"
                            type="button"
                            classNameButton={StyleModule.deleteButton}
                            classNameLabel={StyleModule.deleteButtonLabel}
                            classNameSpan={StyleModule.deleteButtonSpan}
                        />
                    )}
                </div>
            )} */}
            <PaginationControls
                table={table}
                className={StyleModule.paginationControls}
            />
        </div>
    );
};

export default TableFooterControls;
