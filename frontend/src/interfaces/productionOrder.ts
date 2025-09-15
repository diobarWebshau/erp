import type { IInternalProductProductionOrder } from "./internalOrder";
import type { ILocation } from "./locations";
import type { IProduct } from "./product";
import type { IProduction } from "./production";
import type { IProductionLine } from "./productionLines";
import type { IPurchasedOrder } from "./purchasedOrder";
import type { IPurchasedOrderProduct } from "./purchasedOrdersProducts";

interface ExtraData {
    scrap_qty: number;
    location: ILocation;
    production_qty: number;
    production_line: IProductionLine;
}

interface ExtraData2 {
    location: ILocation;
    production_line: IProductionLine;
    purchase_order?: IPurchasedOrder;
    internal_order?: IInternalProductProductionOrder;
}

interface IProductionOrder {
    id: number;
    order_type: 'internal' | 'client';
    order_id: number | null;
    product_id: number | null;
    product_name: string;
    qty: number;
    status: string;
    created_at: string;
    updated_at: string;
    extra_data?: ExtraData;
    extra_data2?: ExtraData2;
    productions?: IProduction[];
    location?: ILocation;
    product?: IProduct;
    production_line?: IProductionLine;
    order?: IPurchasedOrderProduct | IInternalProductProductionOrder;
}

type IPartialProductionOrder = Partial<IProductionOrder>;

const defaultValueProductionOrder: IProductionOrder = {
    id: 0,
    order_type: 'internal',
    order_id: null,
    product_id: null,
    product_name: '',
    qty: 0,
    status: '',
    created_at: '',
    updated_at: '',
};

const defaultValuePartialProductionOrder: IPartialProductionOrder = {
    order_type: 'internal',
    order_id: null,
    product_id: null,
    product_name: '',
    qty: 0,
    status: '',
};

export type {
    IProductionOrder,
    IPartialProductionOrder,
};

export {
    defaultValueProductionOrder,
    defaultValuePartialProductionOrder,
};

