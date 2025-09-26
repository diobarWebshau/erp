import type {
    ColumnDef,
    Row,
    Table,
} from "@tanstack/react-table";
import type {
    RowAction,
    TopButtonAction,
} from "../types";
import ProviderTableContext
    from "./ProviderTableContext";
import TableBase from "./TableBase";

type GenericTableProps<T> = {
    modelName: string;
    columns: ColumnDef<T>[];
    data: T[];
    onDeleteSelected: (datas: T[]) => void;
    rowActions?: RowAction<T>[];
    extraButtons?: TopButtonAction<T>[];
    typeRowActions?: "ellipsis" | "icon";
    enableFilters?: boolean;
    enableSorting?: boolean;
    enableViews?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    enableOptionsColumn?: boolean;
    noResultsMessage?: string;
    extraComponents?: (table: Table<T>) => React.ReactNode;
    footerComponents?: (table: Table<T>) => React.ReactNode;
    classNameGenericTableContainer?: string;
    classNameTableContainer?: string;
    classNameTable?: string;
    classNameTableBody?: string;
    classNameTableHeader?: string;
    classNameFooter?: string;
    classNamePagination?: string;
    classNameExtraComponents?: string;
    getRowId: (row: T, index: number) => string;
    enableRowEditClick?: boolean;
    enableRowEditClickHandler?: (record: T) => void;
    expandedComponent?: React.ReactNode;
    isExpanded?: boolean;
};

const GenericTable = <T,>({
    modelName,
    columns,
    data,
    onDeleteSelected,
    rowActions,
    extraButtons,
    typeRowActions = "ellipsis",
    enableFilters = true,
    enableSorting = true,
    enableViews = true,
    enablePagination = true,
    enableRowSelection = true,
    enableOptionsColumn = true,
    noResultsMessage = "No results.",
    classNameGenericTableContainer,
    classNameTableContainer,
    classNameTable,
    classNameTableBody,
    classNameTableHeader,
    classNameFooter,
    classNameExtraComponents,
    classNamePagination,
    extraComponents,
    footerComponents,
    getRowId,
    enableRowEditClick,
    enableRowEditClickHandler,
    expandedComponent,
    isExpanded,
}: GenericTableProps<T>) => {
    // Aquí va tu lógica y contexto

    return (
        <ProviderTableContext>
            <TableBase
                modelName={modelName}
                columns={columns}
                data={data}
                onDeleteSelected={onDeleteSelected}
                rowActions={rowActions}
                extraButtons={extraButtons}
                typeRowActions={typeRowActions}
                enableFilters={enableFilters}
                enableSorting={enableSorting}
                enableViews={enableViews}
                enablePagination={enablePagination}
                enableRowSelection={enableRowSelection}
                enableOptionsColumn={enableOptionsColumn}
                noResultsMessage={noResultsMessage}
                extraComponents={extraComponents}
                footerComponents={footerComponents}
                classNameGenericTableContainer={classNameGenericTableContainer}
                classNameTableContainer={classNameTableContainer}
                classNameExtraComponents={classNameExtraComponents}
                classNameTable={classNameTable}
                classNameTableBody={classNameTableBody}
                classNameTableHeader={classNameTableHeader}
                classNameFooter={classNameFooter}
                classNamePagination={classNamePagination}
                getRowId={getRowId}
                enableRowEditClick={enableRowEditClick}
                enableRowEditClickHandler={enableRowEditClickHandler}
                expandedComponent={expandedComponent}
                isExpanded={isExpanded}
            />
        </ProviderTableContext>
    );
}

export default GenericTable;
