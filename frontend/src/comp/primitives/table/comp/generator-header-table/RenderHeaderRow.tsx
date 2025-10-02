import { flexRender } from "@tanstack/react-table";
import type { Header, HeaderGroup, Table } from "@tanstack/react-table";
import HeaderPopoverOptions from "./../../comp/generator-header-table/HeaderPopoverOption2";
import stylesModules from "./RenderHeaderRow.module.css"

interface HeaderRowProps<T> {
    header: Header<T, unknown>;
    table: Table<T>;
    enableSorting?: boolean;
    enableFilters?: boolean;
    typeRowActions?: "ellipsis" | "icon";
}

const HeaderRow = <T,>({
    header,
    table,
    enableSorting,
    enableFilters,
    typeRowActions,
}: HeaderRowProps<T>) => {

    const rowCount = table?.getRowModel()?.rows?.length ?? 0;

    return (
        <th key={header.id}
            className={`  ${stylesModules.thTableHeader}`}
            style={{
                backgroundColor: rowCount > 0
                    ? "var(--color-theme-primary-light)"
                    : "var(--color-theme-secondary-light)",
            }}
        >
            {
                header.id === "select" ? (
                    <div
                        className={stylesModules.containerTableHeaderSelect}

                    >
                        <div>
                            <label>
                                {
                                    flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )
                                }
                            </label>
                        </div>
                    </div>
                ) : header.id === "options" ? (
                    <div
                        className={stylesModules.containerTableHeaderOptions}
                    >
                        {
                            typeRowActions === "icon" ? (
                                <div>
                                    <label>
                                        {
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        }
                                    </label>
                                </div>
                            ) : (
                                null
                            )
                        }
                    </div>
                ) : (
                    <div
                        className={
                            header.column.getIsFiltered()
                                ? stylesModules.containerTableHeaderFilter
                                : stylesModules.containerTableHeader
                        }
                    >
                        <div>
                            <label>
                                {
                                    flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )
                                }
                            </label>
                            {enableFilters && (
                                <HeaderPopoverOptions
                                    column={header.column}
                                    table={table}
                                    enableSorting={enableSorting || true}
                                />
                            )}
                        </div>
                    </div>
                )
            }
        </th>
    );
}

interface renderHeaderRowProps<T> {
    group: HeaderGroup<T>
    table: Table<T>,
    enableSorting?: boolean;
    enableFilters?: boolean;
    typeRowActions?: "ellipsis" | "icon";
}

const RenderHeaderRow = <T,>({
    group,
    table,
    enableSorting,
    enableFilters,
    typeRowActions,
}: renderHeaderRowProps<T>) => {

    return (
        <tr
            className={`nunito-bold ${stylesModules.rowTableHeader}`}
            key={group.id}
        >
            {group.headers.map((header) => {
                return (
                    <HeaderRow
                        header={header}
                        table={table}
                        enableSorting={enableSorting}
                        enableFilters={enableFilters}
                        typeRowActions={typeRowActions}
                    />
                );
            })}
        </tr >
    );
}


export default RenderHeaderRow;