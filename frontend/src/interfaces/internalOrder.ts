import type { IProduct } from "./product";
import type { IPartialProductionOrder } from "./productionOrder";

interface IProductionSummaryInternal {
    production_qty: number;
    production_order_qty: number;
    internal_production_order_qty: number;
}


interface IInternalProductProductionOrder {
    id: number;
    product_id: number | null;
    product_name: string;
    qty: number;
    status: string;
    location_id: number | null;
    location_name: string;
    created_at: string;
    updated_at: string;
    production_order?: IPartialProductionOrder;
    product?: IProduct;
    production_summary?: IProductionSummaryInternal;
}

type IPartialInternalProductProductionOrder =
    Partial<IInternalProductProductionOrder>;

const defaultValueInternalProductProductionOrder:
    IInternalProductProductionOrder = {
    id: 0,
    product_id: null,
    product_name: "",
    qty: 0,
    status: "",
    location_id: null,
    location_name: "",
    created_at: "",
    updated_at: "",
};

const defaultValuePartialInternalProductProductionOrder:
    Partial<IInternalProductProductionOrder> = {
    location_id: null,
    product_id: null,
    qty: 0,
};

export type {
    IInternalProductProductionOrder,
    IPartialInternalProductProductionOrder,
}

export {
    defaultValueInternalProductProductionOrder,
    defaultValuePartialInternalProductProductionOrder
}