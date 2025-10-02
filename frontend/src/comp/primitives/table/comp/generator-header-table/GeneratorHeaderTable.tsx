import type { Table } from "@tanstack/react-table";
import renderHeaderRow from "./RenderHeaderRow";
import stylesModules from "./GeneratorHeaderTable.module.css"

interface GeneratorHeaderTableProps<T> {
    table: Table<T>;
    enableSorting?: boolean;
    enableFilters?: boolean;
    typeRowActions?: "ellipsis" | "icon",
    className?: string
}

const GeneratorHeaderTable = <T,>({
    table,
    enableSorting = false,
    enableFilters = false,
    typeRowActions,
    className = "",
}: GeneratorHeaderTableProps<T>) => {
    return (
        <thead
            className={`${stylesModules.tableHeader} ${className}`}
        >
            {table?.getHeaderGroups()?.map((group) => (
                renderHeaderRow({
                    group, table, enableSorting,
                    enableFilters, typeRowActions
                })
            ))}
        </thead>
    );
}

export default GeneratorHeaderTable;
