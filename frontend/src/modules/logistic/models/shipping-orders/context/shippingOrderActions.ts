import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";
import type { IPartialShippingOrderPurchasedOrderProduct } from "../../../../../interfaces/shippingPurchasedProduct";
import type { ShippingOrderAction } from "./shippingOrderTypes";
import { shippingOrderActionsTypes } from "./shippingOrderTypes";

// ? Acciones directas al objeto de shipping order

const set_shipping_order = (
    payload: IPartialShippingOrder
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.SET_SHIPPING_ORDER,
    payload
});

const update_shipping_order = (
    payload: IPartialShippingOrder
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER,
    payload
});

// ? Acciones directas al array de shipping order purchased order products

const add_shipping_order_purchased_order_products = (
    payload: IPartialShippingOrderPurchasedOrderProduct[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS,
    payload
});

const remove_shipping_order_purchased_order_products = (
    payload: (number | string)[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS,
    payload
});

const update_shipping_order_purchased_order_products = (
    payload: { id: number | string; attributes: IPartialShippingOrderPurchasedOrderProduct }
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS,
    payload
});
// ? Acciones directas al array de shipping order purchased order products aux

const add_shipping_order_purchased_order_products_aux = (
    payload: IPartialShippingOrderPurchasedOrderProduct[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX,
    payload
});

const remove_shipping_order_purchased_order_products_aux = (
    payload: (number | string)[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX,
    payload
});

const update_shipping_order_purchased_order_products_aux = (
    payload: { id: number | string; attributes: IPartialShippingOrderPurchasedOrderProduct }
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX,
    payload
});

// ? Acciones directas al objeto de draft shipping order

const set_draft_shipping_order = (
    payload: IPartialShippingOrder
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.SET_DRAFT_SHIPPING_ORDER,
    payload
});

const update_draft_shipping_order = (
    payload: IPartialShippingOrder
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER,
    payload
});

// ? Acciones directas al array de shipping order purchased order products

const add_draft_shipping_order_purchased_order_products = (
    payload: IPartialShippingOrderPurchasedOrderProduct[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS,
    payload
});

const remove_draft_shipping_order_purchased_order_products = (
    payload: (number | string)[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS,
    payload
});

const update_draft_shipping_order_purchased_order_products = (
    payload: { id: number | string; attributes: IPartialShippingOrderPurchasedOrderProduct }
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS,
    payload
});
// ? Acciones directas al array de shipping order purchased order products aux

const add_draft_shipping_order_purchased_order_products_aux = (
    payload: IPartialShippingOrderPurchasedOrderProduct[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX,
    payload
});

const remove_draft_shipping_order_purchased_order_products_aux = (
    payload: (number | string)[]
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX,
    payload
});

const update_draft_shipping_order_purchased_order_products_aux = (
    payload: { id: number | string; attributes: IPartialShippingOrderPurchasedOrderProduct }
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX,
    payload
});



// ? Acciones de los steps

const set_step = (
    payload: number
): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.SET_STEP,
    payload
});

const back_step = (): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.BACK_STEP
});

const next_step = (): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.NEXT_STEP
});

// ? Acciones de limpieza

const clear = (): ShippingOrderAction => ({
    type: shippingOrderActionsTypes.CLEAR
});


export {
    set_shipping_order,
    update_shipping_order,
    add_shipping_order_purchased_order_products,
    remove_shipping_order_purchased_order_products,
    update_shipping_order_purchased_order_products,
    add_shipping_order_purchased_order_products_aux,
    remove_shipping_order_purchased_order_products_aux,
    update_shipping_order_purchased_order_products_aux,
    set_draft_shipping_order,
    update_draft_shipping_order,
    add_draft_shipping_order_purchased_order_products,
    remove_draft_shipping_order_purchased_order_products,
    update_draft_shipping_order_purchased_order_products,
    add_draft_shipping_order_purchased_order_products_aux,
    remove_draft_shipping_order_purchased_order_products_aux,
    update_draft_shipping_order_purchased_order_products_aux,
    set_step,
    back_step,
    next_step,
    clear
}
