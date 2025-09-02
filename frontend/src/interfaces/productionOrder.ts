import type { ILocation } from "./locations";
import type { IProduct } from "./product";
import type { IProduction } from "./production";
import type { IProductionLine } from "./productionLines";
import type { IPurchasedOrder } from "./purchasedOrder";

interface ExtraData {
    scrap_qty: number;
    location: ILocation;
    production_qty: number;
    production_line: IProductionLine;
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
    productions?: IProduction[];
    location?: ILocation;
    product?: IProduct;
    purchase_order?: IPurchasedOrder;
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

