interface IInventoryInput {
    input_id: number,
    input_name: string,
    available: number,
    stock: number,
    equivalence: number,
    minimum_stock: number,
    maximum_stock: number,
}


export type {
    IInventoryInput
};
