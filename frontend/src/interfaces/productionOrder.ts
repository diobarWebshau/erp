import type { IInternalProductProductionOrder } from "./internalOrder";
import type { ILocation } from "./locations";
import type { IProduct } from "./product";
import type { IProduction } from "./production";
import type { IProductionLine } from "./productionLines";
import type { IPurchasedOrder } from "./purchasedOrder";
import type { IPurchasedOrderProduct } from "./purchasedOrdersProducts";


interface IProductionBreakdown {
    finished: number;
    order_id: number;
    order_qty: number;
    all_stages: IAllStage[];
    order_type: string;
    product_id: number;
    not_started: number;
    open_stages: IOpenStage[];
    remaining_qty: number;
    open_wip_total: number;
}

interface IAllStage {
    stage: number;
    process_id: number;
    wip_at_stage: number;
    done_at_stage: number;
    next_stage_done: number;
}

interface IOpenStage {
    stage: number;
    process_id: number;
    in_stage_now: number;
    passed_excluding_finished: number;
}


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
    purchase_order?: IPurchasedOrder;
    production_line?: IProductionLine;
    order?: IPurchasedOrderProduct | IInternalProductProductionOrder;
    production_breakdown?: IProductionBreakdown;
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
    IProductionBreakdown,
    IAllStage,
    IOpenStage
};

export {
    defaultValueProductionOrder,
    defaultValuePartialProductionOrder,
};

