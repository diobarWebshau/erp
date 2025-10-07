import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";
import type { IPartialShippingOrderPurchasedOrderProduct } from "../../../../../interfaces/shippingPurchasedProduct";

type ShippingOrderState = {
    total_steps: number,
    current_step: number,
    data: IPartialShippingOrder,
}

const shippingOrderActionsTypes = {
    SET_SHIPPING_ORDER: "SET_SHIPPING_ORDER",
    UPDATE_SHIPPING_ORDER: "UPDATE_SHIPPING_ORDER",
    ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
    UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: "UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS",
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
    | { type: typeof shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: number[] }
    | { type: typeof shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS, payload: { id: number, attributes: IPartialShippingOrderPurchasedOrderProduct } }
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
};
