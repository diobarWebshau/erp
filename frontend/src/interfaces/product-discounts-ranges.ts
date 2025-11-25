import type {
    IProduct
} from "./product";

interface IProductDiscountRange {
    id: number | string;
    product_id: number | null;
    unit_price: number;
    min_qty: number;
    max_qty: number;
    created_at: string;
    updated_at: string;
    product?: IProduct;
}

type IPartialProductDiscountRange =
    Partial<IProductDiscountRange>;

interface ProductDiscountRangeManager {
    added: IPartialProductDiscountRange[];
    deleted: IProductDiscountRange[];
    modified: IPartialProductDiscountRange[];
}

const defaultValueProductDiscountRange:
    IProductDiscountRange = {
    id: 0,
    product_id: null,
    unit_price: 0,
    min_qty: 0,
    max_qty: 0,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialProductDiscountRange:
    IPartialProductDiscountRange = {
    product_id: null,
    unit_price: 0,
    min_qty: 0,
    max_qty: 0,
};



export type {
    IProductDiscountRange,
    IPartialProductDiscountRange,
    ProductDiscountRangeManager
};

export {
    defaultValueProductDiscountRange,
    defaultValuePartialProductDiscountRange,
    
};
