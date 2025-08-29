
interface IAppliedProductDiscountRange {
    id: number;
    product_discount_range_id: number | null;
    purchase_order_product_id: number;
    unit_discount: number;
    min_qty: number;
    max_qty: number;
    created_at: string;
    updated_at: string;
}

type IPartialAppliedProductDiscountRange = Partial<IAppliedProductDiscountRange>;

const defaultValueAppliedProductDiscountRange: IAppliedProductDiscountRange = {
    id: 0,
    product_discount_range_id: null,
    purchase_order_product_id: 0,
    unit_discount: 0,
    min_qty: 0,
    max_qty: 0,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialAppliedProductDiscountRange: IPartialAppliedProductDiscountRange = {
    product_discount_range_id: null,
    purchase_order_product_id: 0,
    unit_discount: 0,
    min_qty: 0,
    max_qty: 0,
};

export type {
    IAppliedProductDiscountRange,
    IPartialAppliedProductDiscountRange,
};

export {
    defaultValueAppliedProductDiscountRange,
    defaultValuePartialAppliedProductDiscountRange,
};
