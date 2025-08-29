import type {
    IProduct
} from "./product";

interface IProductionLineProduct {
    id: number;
    product_id: number;
    production_line_id: number;
    products?: IProduct;
}

type IPartialProductionLineProduct =
    Partial<IProductionLineProduct>;

interface IProductionLineProductManager {
    added: IPartialProductionLineProduct[],
    deleted: IProductionLineProduct[],
    modified: IPartialProductionLineProduct[],
}

const defaultValueProductionLineProduct:
    IProductionLineProduct = {
    id: 0,
    product_id: 0,
    production_line_id: 0,
};

const defaultValuePartialProductionLineProduct:
    IPartialProductionLineProduct = {
    product_id: 0,
    production_line_id: 0,
};

export type {
    IProductionLineProduct,
    IPartialProductionLineProduct,
    IProductionLineProductManager,
};

export {
    defaultValueProductionLineProduct,
    defaultValuePartialProductionLineProduct,
};
