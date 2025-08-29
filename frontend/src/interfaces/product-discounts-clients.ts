interface IProductDiscountClient {
    id: number;
    product_id: number;
    client_id: number;
    discount_percentage: number;
    created_at: string;
    updated_at: string;
}

type IPartialProductDiscountClient =
    Partial<IProductDiscountClient>

export type {
    IProductDiscountClient,
    IPartialProductDiscountClient
}
