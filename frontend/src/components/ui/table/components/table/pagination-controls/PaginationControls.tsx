import type {
    Table
} from "@tanstack/react-table";
import type {
    ChangeEvent
} from "react";
import StyleModule
    from "./pagination-controls.module.css";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Select
    from "../../gui/select-customized/SelectCustomized";
import {
    useTableDispatch,
    useTableState
} from "./../../../tableContext/tableHooks"
import {
    set_page_index,
    set_page_size
} from "./../../../tableContext/tableActions"


interface IPaginationControlsProps<T> {
    className?: string,
    table: Table<T>,
}

const PaginationControls = <T,>(
    {
        className = "",
        table,
    }: IPaginationControlsProps<T>
) => {

    const state = useTableState();
    const dispatch = useTableDispatch();

    const onChangeSelectRowsPerPage = (
        e: ChangeEvent<HTMLSelectElement>
    ) => {
        const value: number =
            Number(e.currentTarget.value);
        dispatch(set_page_size(value));
        dispatch(set_page_index(0));
    }

    console.log(`
        ${state.paginationState.pageIndex * state.paginationState.pageSize}-
    `)

    return (
        <>
            <div className={`${StyleModule.container} ${className}`}>
                <div
                    className={StyleModule.selectRowPerPage}
                >
                    <label>Rows per page</label>
                    <Select
                        options={["10", "20", "30", "40", "50", "100"]}
                        defaultValue={String(state.paginationState.pageSize)}
                        icon={<ChevronDown size={20} />}
                        onChange={onChangeSelectRowsPerPage}
                        className={StyleModule.select}
                    ></Select>
                </div>
                <div
                    className={StyleModule.pageInfo}
                >
                    <label>
                        {
                            table.getPrePaginationRowModel().rows.length === 0
                                ? "0 of 0"
                                : (
                                    (state.paginationState.pageIndex * state.paginationState.pageSize + 1)
                                    + "-"
                                    + (state.paginationState.pageIndex * state.paginationState.pageSize + table.getPaginationRowModel().rows.length)
                                    + " of "
                                    + table.getPrePaginationRowModel().rows.length
                                )
                        }
                    </label>
                </div>
                <div
                    className={StyleModule.paginationButtonSection}
                >
                    {/* <button
                        onClick={() => table?.setPageIndex(0)}
                        disabled={!table?.getCanPreviousPage()}
                        aria-label="First page"
                    >
                        First
                    </button> */}
                    <button
                        className={StyleModule.arrowLeftButton}
                        onClick={() => table?.previousPage()}
                        disabled={!table?.getCanPreviousPage()}
                    >
                        <ChevronLeft
                            className={StyleModule.arrowLeft}
                            size={20}
                        />
                    </button>
                    <button
                        className={StyleModule.arrowRightButton}
                        onClick={() => table?.nextPage()}
                        disabled={!table?.getCanNextPage()}
                    >
                        <ChevronRight
                            className={StyleModule.arrowRight}
                            // color="#423DD9"
                            size={20}
                        />
                    </button>
                    {/* <button
                        onClick={() => table?.setPageIndex(table?.getPageCount() - 1)}
                        disabled={!table?.getCanNextPage()}
                        aria-label="Last page"
                    >
                        Last
                    </button> */}
                </div>
            </div>
        </>
    );
}

export default PaginationControls;