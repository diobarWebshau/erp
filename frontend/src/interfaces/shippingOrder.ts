import type {
    IPartialCarrier
} from "./carriers";
import type {
    IPartialShippingOrderPurchasedOrderProduct,
    IShippingOrderPurchasedOrderProductManager
} from "./shippingPurchasedProduct";

interface LoadEvidenceItem {
    path: string | File | null;
    id: string;
}

interface PartialLoadEvidenceItem {
    id?: string;
    path?: string | File | null;
}

interface LoadEvidenceManager {
    added: LoadEvidenceItem[],
    deleted: LoadEvidenceItem[],
    modified: LoadEvidenceItem[],
}

interface IShippingOrder {
    id: number;
    code: string | null;
    status: string;
    carrier_id: number | null;
    load_evidence: LoadEvidenceItem[] | File[] | null;
    delivery_cost: number;
    created_at: string;
    updated_at: string;
    shipping_order_purchase_order_product?:
    IPartialShippingOrderPurchasedOrderProduct[],
    shipping_order_purchase_order_product_aux?:
    IPartialShippingOrderPurchasedOrderProduct[],
    shipping_order_purchase_order_product_manager?:
    IShippingOrderPurchasedOrderProductManager,
    carrier?: IPartialCarrier,
    load_evidence_old?: PartialLoadEvidenceItem[],
    load_evidence_deleted?: PartialLoadEvidenceItem[],
}

type IPartialShippingOrder =
    Partial<IShippingOrder>;

const defaultValueShippingOrder:
    IShippingOrder = {
    id: 0,
    code: null,
    status: '',
    carrier_id: null,
    load_evidence: null,
    delivery_cost: 0,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialShippingOrder:
    IPartialShippingOrder = {
    code: null,
    status: '',
    carrier_id: null,
    load_evidence: null,
    delivery_cost: 0,
};

export type {
    IShippingOrder,
    IPartialShippingOrder,
    LoadEvidenceItem,
    LoadEvidenceManager,
    PartialLoadEvidenceItem
};

export {
    defaultValueShippingOrder,
    defaultValuePartialShippingOrder,
};
