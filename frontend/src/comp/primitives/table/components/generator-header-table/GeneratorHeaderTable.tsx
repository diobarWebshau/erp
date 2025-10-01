import {
    type Table
} from "@tanstack/react-table";
import {
    type Column,
} from "@tanstack/react-table"
import stylesModules
    from "./GeneratorHeaderTable.module.css"
import renderHeaderRow
    from "./RenderHeaderRow";
import type {
    ColumnTypeDataFilter,
} from "../../../../../interfaces/tableTypes";

interface GeneratorHeaderTableProps<T> {
    table: Table<T>;
    enableSorting?: boolean;
    enableFilters?: boolean;
    handlerOnClickButtonFilter: (
        column: Column<T>
    ) => void,
    handlerOnClickButtonAddFilterColumn: (
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
                    handlerOnClickButtonFilter,
                    handlerOnClickButtonAddFilterColumn,
                    typeRowActions,
                })
            ))}
        </thead>
    );
}

export default GeneratorHeaderTable;
