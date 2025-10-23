import type { IPartialLocation } from "./locations";
import type {
    IPartialPurchasedOrderProduct
} from "./purchasedOrdersProducts";


interface IShippingOrderPurchasedOrderProduct {
    id: number | string;
    shipping_order_id: number | null;
    purchase_order_product_id: number;
    qty: number;
    location_id: number;
    location_name: string;
    purchase_order_products?: IPartialPurchasedOrderProduct;
    location?: IPartialLocation;
}

type IPartialShippingOrderPurchasedOrderProduct =
    Partial<IShippingOrderPurchasedOrderProduct>;

interface IShippingOrderPurchasedOrderProductManager {
    added: IPartialShippingOrderPurchasedOrderProduct[],
    deleted: IShippingOrderPurchasedOrderProduct[],
    modified: IPartialShippingOrderPurchasedOrderProduct[],
}

const defaultValueShippingOrderPurchasedOrderProduct:
    IShippingOrderPurchasedOrderProduct = {
    qty: 0,
    id: 0,
    shipping_order_id: null,
    purchase_order_product_id: 0,
    location_id: 0,
    location_name: "",
};

const defaultValuePartialShippingOrderPurchasedOrderProduct:
    IPartialShippingOrderPurchasedOrderProduct = {
    qty: 0,
    shipping_order_id: null,
    purchase_order_product_id: 0,
    location_id: 0,
    location_name: "",
};

export type {
    IShippingOrderPurchasedOrderProduct,
    IPartialShippingOrderPurchasedOrderProduct,
    IShippingOrderPurchasedOrderProductManager
};

export {
    defaultValueShippingOrderPurchasedOrderProduct,
    defaultValuePartialShippingOrderPurchasedOrderProduct,
};
