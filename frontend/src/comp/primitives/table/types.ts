// interface de estado para columnas con tipo number
interface ObjectNumericFilter {
    min: number | undefined;
    max?: number | undefined;
}

// interface de estado para columnas con tipo date
interface ObjectDateFilter {
    from: Date | undefined;
    to?: Date | undefined;
}

type BooleanFilter = string | undefined;

type EnumFilter = string | undefined;

// type general para el filtro de columnas
type ColumnTypeDataFilter =
    ObjectNumericFilter | string | string[] |
    ObjectDateFilter | BooleanFilter | EnumFilter;

interface RowAction<T> {
    label: string;
    onClick: (data: T) => void;
    icon?: React.ReactNode;
    disabled?: (data: T) => boolean;
    condition?: (data: T) => boolean;
}

const getDefaultResetValue = (meta: string) => {
    let value: ColumnTypeDataFilter;
    switch (meta) {
        case "boolean":
            value = undefined as BooleanFilter;
            return value;
        case "string":
            value = [] as string[];
            return value;
        case "number":
            value = {
                min: undefined, max: undefined
            } as ObjectNumericFilter;
            return value;
        case "date":
            value = {
                from: undefined, to: undefined
            } as ObjectDateFilter;
            return value;
        case "enum":
            value = undefined as EnumFilter;
            return value;
    }
}

interface TopButtonAction<T> {
    label: string;
    onClick: (data?: T[]) => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    component?: React.ReactNode;
}


// Nuevo tipo para acciones ya envueltas
interface WrappedRowAction {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: () => boolean;
}

type BaseRow = { id: string | number };


export type {
    ObjectDateFilter,
    ObjectNumericFilter,
    BooleanFilter,
    EnumFilter,
    ColumnTypeDataFilter,
    RowAction,
    WrappedRowAction,
    TopButtonAction,
    BaseRow
};  

export { getDefaultResetValue };
