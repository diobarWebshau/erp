import type {
    IPartialProduct
} from "./product";
import type {
    IPartialAppliedProductDiscountClient
} from "./appliedProductDiscountClient"
import type {
    IPartialAppliedProductDiscountRange
} from "./appliedProductDiscountRange"
import type {
    IPartialClient
} from "./clients";
import type {
    IPartialClientAddress
} from "./clientAddress";
import type {
    IPartialPurchasedOrder
} from "./purchasedOrder";
import type {
    IPartialShippingOrderPurchasedOrderProduct
} from "./shippingPurchasedProduct";
import type {
    IPartialPurchasedOrderProductLocationProductionLine
} from "./popProductionLines";
import type { IPartialProductionOrder } from "./productionOrder";
import type { IPartialLocation } from "./locations";

interface IProductionSummary {
    production_qty: number;
    production_order_qty: number;
    purchased_order_product_qty: number;
}

interface IStockAvailable {
    location_id: number;
    location_name: string;
    stock: number;
    maximum_stock: number;
    minimum_stock: number;
    available: number;
    product_id: number;
    product_name: string;
}

interface IShippingSummary {
    order_qty: number;
    shipping_qty: number;
}

interface IInventoryCommited {
    id: number;
    item_id: number;
    is_locked: number;
    item_name: string;
    item_type: string;
    qty: number;
    description: string;
    location_id: number;
    reference_id: number;
    location_name: string;
    movement_type: string;
    production_id: number;
    reference_type: string;
    location?: IPartialLocation;
}

interface IPurchasedOrderProduct {
    id: number;
    purchase_order_id: number | null;
    product_id: number | null;
    product_name: string;
    qty: number;
    recorded_price: number;
    original_price: number;
    status: string;
    client?: IPartialClient,
    address?: IPartialClientAddress,
    product?: IPartialProduct,
    applied_product_discount_range?: IPartialAppliedProductDiscountRange,
    applied_product_discount_client?: IPartialAppliedProductDiscountClient,
    purchase_order?: IPartialPurchasedOrder,
    shipping_order_purchase_order_product?:
    IPartialShippingOrderPurchasedOrderProduct[],
    purchase_order_product_location_production_line?:
    IPartialPurchasedOrderProductLocationProductionLine,
    was_price_edited_manually?: boolean | null,
    production_summary?: IProductionSummary,
    stock_available?: IStockAvailable,
    shipping_summary?: IShippingSummary,
    production_order?: IPartialProductionOrder,
    inventory_commited?: IInventoryCommited,
}

interface IPurchasedOrderProductManager {
    added: IPartialPurchasedOrderProduct[],
    deleted: IPurchasedOrderProduct[],
    modified: IPartialPurchasedOrderProduct[],
}

type IPartialPurchasedOrderProduct =
    Partial<IPurchasedOrderProduct>;

const defaultValuePurchasedOrderProduct:
    IPurchasedOrderProduct = {
    id: 0,
    purchase_order_id: null,
    product_id: null,
    product_name: "",
    original_price: 0,
    qty: 0,
    recorded_price: 0,
    status: "",
};

const defaultValuePartialPurchasedOrderProduct:
    IPartialPurchasedOrderProduct = {
    purchase_order_id: null,
    product_id: null,
    qty: 0,
    original_price: 0,
    recorded_price: 0,
};

export type {
    IPurchasedOrderProduct,
    IPartialPurchasedOrderProduct,
    IPurchasedOrderProductManager,
};

export {
    defaultValuePurchasedOrderProduct,
    defaultValuePartialPurchasedOrderProduct,
};
