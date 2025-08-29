
interface IAppliedProductDiscountClient {
    id: number;
    purchase_order_product_id: number;
    product_discount_client_id: number | null;
    discount_percentage: number;
    created_at: string;
    updated_at: string;
}

type IPartialAppliedProductDiscountClient = Partial<IAppliedProductDiscountClient>;

const defaultValueAppliedProductDiscountClient: IAppliedProductDiscountClient = {
    id: 0,
    purchase_order_product_id: 0,
    product_discount_client_id: null,
    discount_percentage: 0,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialAppliedProductDiscountClient: IPartialAppliedProductDiscountClient = {
    purchase_order_product_id: 0,
    product_discount_client_id: null,
    discount_percentage: 0,
};

export type {
    IAppliedProductDiscountClient,
    IPartialAppliedProductDiscountClient,
};

export {
    defaultValueAppliedProductDiscountClient,
    defaultValuePartialAppliedProductDiscountClient,
};