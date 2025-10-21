import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";
import type { IPartialShippingOrderPurchasedOrderProduct } from "../../../../../interfaces/shippingPurchasedProduct";

interface ShippingOrderState {
    total_steps: number,
    current_step: number,
    data: IPartialShippingOrder,
    draft: IPartialShippingOrder,
}

const initialShippingOrderState: ShippingOrderState = {
    total_steps: 2,
    current_step: 1,
    data: {
        shipping_order_purchase_order_product: [],
        shipping_order_purchase_order_product_aux: [],
    },
    draft: {
        shipping_order_purchase_order_product: [],
        shipping_order_purchase_order_product_aux: [],
    },
}

const shippingOrderActionsTypes = {
    SET_SHIPPING_ORDER: "SET_SHIPPING_ORDER",
    UPDATE_SHIPPING_ORDER: "UPDATE_SHIPPING_ORDER",
    ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: "ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX",
    REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: "REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX",
    UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: "UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX",
    SET_DRAFT_SHIPPING_ORDER: "SET_DRAFT_SHIPPING_ORDER",
    UPDATE_DRAFT_SHIPPING_ORDER: "UPDATE_DRAFT_SHIPPING_ORDER",
    ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: "ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX",
    REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: "REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX",
    UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: "UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX",
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    CLEAR: "CLEAR",
} as const;

type ShippingOrderActionType =
    typeof shippingOrderActionsTypes[keyof typeof shippingOrderActionsTypes];

type ShippingOrderAction =
    // Acciones directas al objeto de shipping order
    | { type: typeof shippingOrderActionsTypes.SET_SHIPPING_ORDER, payload: IPartialShippingOrder }
    | { type: typeof shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER, payload: IPartialShippingOrder }
    // Acciones directas al array de shipping order purchased order products
    | { type: typeof shippingOrderActionsTypes.ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: IPartialShippingOrderPurchasedOrderProduct[] }
    | { type: typeof shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: (number | string)[] }
    | { type: typeof shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: { id: number | string, attributes: IPartialShippingOrderPurchasedOrderProduct } }
    // Acciones directas al array de shipping order purchased order products aux
    | { type: typeof shippingOrderActionsTypes.ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX, payload: IPartialShippingOrderPurchasedOrderProduct[] }
    | { type: typeof shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX, payload: (number | string)[] }
    | { type: typeof shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX, payload: { id: number | string, attributes: IPartialShippingOrderPurchasedOrderProduct } }
    // Acciones directas al objeto de draft shipping order
    | { type: typeof shippingOrderActionsTypes.SET_DRAFT_SHIPPING_ORDER, payload: IPartialShippingOrder }
    | { type: typeof shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER, payload: IPartialShippingOrder }
    // Acciones directas al array de draft shipping order purchased order products
    | { type: typeof shippingOrderActionsTypes.ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: IPartialShippingOrderPurchasedOrderProduct[] }
    | { type: typeof shippingOrderActionsTypes.REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: (number | string)[] }
    | { type: typeof shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: { id: number | string, attributes: IPartialShippingOrderPurchasedOrderProduct } }
    // Acciones directas al array de draft shipping order purchased order products aux
    | { type: typeof shippingOrderActionsTypes.ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX, payload: IPartialShippingOrderPurchasedOrderProduct[] }
    | { type: typeof shippingOrderActionsTypes.REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX, payload: (number | string)[] }
    | { type: typeof shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX, payload: { id: number | string, attributes: IPartialShippingOrderPurchasedOrderProduct } }
    // Acciones de los steps
    | { type: typeof shippingOrderActionsTypes.SET_STEP, payload: number }
    | { type: typeof shippingOrderActionsTypes.BACK_STEP }
    | { type: typeof shippingOrderActionsTypes.NEXT_STEP }
    // Acciones de limpieza
    | { type: typeof shippingOrderActionsTypes.CLEAR };

export type {
    ShippingOrderState,
    ShippingOrderAction,
    ShippingOrderActionType,
};

export {
    shippingOrderActionsTypes,
    initialShippingOrderState,
};
