import type { ColumnDef, Row, RowSelectionState, Table } from "@tanstack/react-table";
import type { RowAction, TopButtonAction } from "../types";
import ProviderTableContext from "./ProviderTableContext";
import TableBase from "./TableBase";
import type { TableState, TableStatePartial } from "./tableTypes";
import { DEFAULT_TABLE_STATE } from "./tableTypes";
import { useMemo } from "react";

interface GenericTableProps<T> {
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
    onRowSelectionChange?: (selected: T[], table?: Table<T>) => void;
    conditionalRowSelection?: (updater: RowSelectionState, rows: Row<T>[]) => boolean;
    extraComponents?: (table?: Table<T>) => React.ReactNode;
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
    initialState?: TableStatePartial;
};

const GenericTable = <T,>({
    modelName,
    columns,
    data,
    onDeleteSelected,
    rowActions,
    extraButtons,
    typeRowActions = "ellipsis",
    enableFilters = false,
    enableSorting = false,
    enableViews = false,
    enablePagination = false,
    enableRowSelection = false,
    enableOptionsColumn = false,
    noResultsMessage = "No results.",
    classNameGenericTableContainer,
    classNameTableContainer,
    onRowSelectionChange,
    conditionalRowSelection,
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
    initialState,
}: GenericTableProps<T>) => {

    /*
        Calculamos el estado final unicamente si, se establece initialState
        Evita recrear objeto en cada render si initialState no cambia
    */
    const finalState = useMemo<TableState>(() => ({
        ...DEFAULT_TABLE_STATE,
        ...(initialState || {}),
    }), [initialState]);


    return (
        <ProviderTableContext
            initialState={finalState}
        >
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
                onRowSelectionChange={onRowSelectionChange}
                enableRowSelection={enableRowSelection}
                conditionalRowSelection={conditionalRowSelection}
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
        </ProviderTableContext >
    );
}

export default GenericTable;


// ! ¿Como manejar el initialState en el padre ?

/* 
    --- ¿Solo quieres inicializar una vez?
        
        Pasamos initialState como objeto memorizado (useMemo en el padre). No se volverá a resetear. 
        
        @Ejemplo: 
            const initialState = useMemo(() => ({ ...  }), []);
            <GenericTable initialState={initialState} />


    --- ¿Quieres poder “resetear” la tabla desde el padre?

        Haz que initialState sea estado (o uses una versión).


        @ Como estado:
            const [initialState, setInitialState] = useState<TableState>(...estadoBase);
            const reset = () => setInitialState(...estadoBase);
            <GenericTable initialState={initialState} />

        @ Con versión (más ligero si el objeto es grande):
            const [version, setVersion] = useState(0);
            const initialState = useMemo(() => ({ ...estadoBase }), [version]);
            const reset = () => setVersion(v => v + 1);
            <GenericTable initialState={initialState} />

    ¿Por qué funciona?
        Tu Provider solo re-aplica el estado cuando cambia la referencia de initialState después del montaje. Por eso:

        Si no quieres resets → mantén la misma referencia (memo vacío).

        Si quieres resets → cambia la referencia (con estado o versión).

    Reglas rápidas:

        No pases {} inline en cada render.

        Si no necesitas overrides, puedes omitir la prop initialState.

        Para resets controlados, usa estado o versión en el padre.

*/