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
    /* datos unicos de SO */
    id: number;
    code: string | null;
    status: string;

    /* logisitica */
    carrier_id: number | null;
    load_evidence: LoadEvidenceItem[] | File[] | null;
    transport_method: string;
    tracking_number: string | null;
    delivery_cost: number;
    shipment_type: string;
    carrier?: IPartialCarrier,
    load_evidence_old?: PartialLoadEvidenceItem[],
    load_evidence_deleted?: PartialLoadEvidenceItem[],

    /* comentarios */
    comments?: string | null;
    comments_finish?: string | null;

    /* informacion  */
    received_by?: string | null;
    user_id?: number | null;
    user_name?: string | null;

    /* fechas */
    delivery_date?: Date | string | null;
    scheduled_ship_date: Date | string | null;
    shipping_date: Date | string | null;
    finished_date?: Date | string | null;
    created_at: Date;
    updated_at: Date;

    /* auxiliares */
    shipping_order_purchase_order_product?:
    IPartialShippingOrderPurchasedOrderProduct[],
    shipping_order_purchase_order_product_aux?:
    IPartialShippingOrderPurchasedOrderProduct[],
    shipping_order_purchase_order_product_manager?:
    IShippingOrderPurchasedOrderProductManager,
};

type IPartialShippingOrder =
    Partial<IShippingOrder>;


export type {
    IShippingOrder,
    IPartialShippingOrder,
    LoadEvidenceItem,
    LoadEvidenceManager,
    PartialLoadEvidenceItem
};