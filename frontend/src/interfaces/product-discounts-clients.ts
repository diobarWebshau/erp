import type { IClient } from "./clients";
import type { IProduct } from "./product";

interface IProductDiscountClient {
    id: number | string;
    product_id: number;
    client_id: number;
    product: IProduct;
    client: IClient;
    discount_percentage: number;
    created_at: string;
    updated_at: string;
}

interface IProductDiscountClientManager {
    added: IPartialProductDiscountClient[];
    deleted: IPartialProductDiscountClient[];
    modified: IPartialProductDiscountClient[];
}

type IPartialProductDiscountClient =
    Partial<IProductDiscountClient>

export type {
    IProductDiscountClient,
    IPartialProductDiscountClient,
    IProductDiscountClientManager
}
