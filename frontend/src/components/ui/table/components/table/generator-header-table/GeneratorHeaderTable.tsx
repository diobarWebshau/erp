import {
    type Table
} from "@tanstack/react-table";
import {
    type Column,
} from "@tanstack/react-table"
import type {
    Dispatch,
    MouseEvent,
    RefObject,
    SetStateAction
} from "react";
import stylesModules
    from "./GeneratorHeaderTable.module.css"
import renderHeaderRow
    from "./RenderHeaderRow";
import type {
    ColumnTypeDataFilter,
    BaseRow
} from "../../../types";
import { useTableDispatch, useTableState } from "../../../tableContext/tableHooks";

interface GeneratorHeaderTableProps<T> {
    table: Table<T>;
    enableSorting?: boolean;
    enableFilters?: boolean;
    isVisibleFilterPopover: string | null;
    setIsVisibleFilterPopover: Dispatch<
        SetStateAction<string | null>
    >,
    filterTriggerRefs: RefObject<
        Record<string, HTMLButtonElement | null>
    >,
    filterPopoverRef: RefObject<
        HTMLDivElement | null
    >,
    handlerOnClickButtonFilter: (
        e: MouseEvent<HTMLButtonElement>,
        column: Column<T>
    ) => void,
    handlerOnClickButtonAddFilterColumn: (
        e: MouseEvent<HTMLButtonElement>,
        column: Column<T>,
        value: ColumnTypeDataFilter
    ) => void,
    typeRowActions?: "ellipsis" | "icon",
    className?: string
}

const GeneratorHeaderTable = <T,>({
    table,
    enableSorting = false,
    enableFilters = false,
    isVisibleFilterPopover,
    setIsVisibleFilterPopover,
    filterTriggerRefs,
    filterPopoverRef,
    handlerOnClickButtonFilter,
    handlerOnClickButtonAddFilterColumn,
    typeRowActions,
    className = "",
}: GeneratorHeaderTableProps<T>) => {
    return (
        <thead
            className={`${stylesModules.tableHeader} ${className}`}
        >
            {table?.getHeaderGroups()?.map((group) => (
                renderHeaderRow({
                    group,
                    table,
                    enableSorting,
                    enableFilters,
                    isVisibleFilterPopover,
                    setIsVisibleFilterPopover,
                    filterTriggerRefs,
                    filterPopoverRef,
                    handlerOnClickButtonFilter,
                    handlerOnClickButtonAddFilterColumn,
                    typeRowActions,
                })
            ))}
        </thead>
    );
}

export default GeneratorHeaderTable;
