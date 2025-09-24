type BaseRow = { id: string | number };

type StrictStringKeys<T> = {
    [K in keyof T]-?: NonNullable<T[K]> extends string ? K : never
}[keyof T];

export type {
    BaseRow,
    StrictStringKeys
};
