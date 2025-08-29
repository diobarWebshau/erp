import type {
    IPartialPurchasedOrder
} from "../../../../../../../interfaces/purchasedOrder";
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../../interfaces/purchasedOrdersProducts";
import type {
    ModalAddAction,
} from "./modalAddTypes";
import {
    ModalAddActionsTypes,
} from "./modalAddTypes";

// * ************ Acciones globales  ************/

const set_purchase_order = (
    payload: IPartialPurchasedOrder
): ModalAddAction => ({
    type: ModalAddActionsTypes.SET_PURCHASE_ORDER,
    payload
});

const update_purchase_order = (
    payload: IPartialPurchasedOrder
): ModalAddAction => ({
    type: ModalAddActionsTypes.UPDATE_PURCHASE_ORDER,
    payload
});

// * ************ Acciones de productos  ************/

const add_purchase_order_products = (
    payload: IPartialPurchasedOrderProduct[]
): ModalAddAction => ({
    type: ModalAddActionsTypes.ADD_PURCHASE_ORDER_PRODUCTS,
    payload
});

const remove_purchase_order_products = (
    payload: IPartialPurchasedOrderProduct
): ModalAddAction => ({
    type: ModalAddActionsTypes.REMOVE_PURCHASE_ORDER_PRODUCTS,
    payload
});

const set_purchase_order_products_qty = (
    payload: { id: number, qty: number }
): ModalAddAction => ({
    type: ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_QTY,
    payload
});

const set_purchase_order_products_price = (
    payload: {
        id: number,
        recorded_price: number
    }
): ModalAddAction => ({
    type: ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE,
    payload
});

const set_purchase_order_products_price_manual = (
    payload: { id: number, was_price_edited_manually: boolean | null }
): ModalAddAction => ({
    type: ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL,
    payload
});

// * ************ Acciones de steps del wizard  ************/

const set_step = (
    payload: number
): ModalAddAction => ({
    type: ModalAddActionsTypes.SET_STEP,
    payload
});

const back_step = (): ModalAddAction => ({
    type: ModalAddActionsTypes.BACK_STEP,
});

const next_step = (): ModalAddAction => ({
    type: ModalAddActionsTypes.NEXT_STEP,
});


// * ************ Acciones de clear  ************/

const clear = (): ModalAddAction => ({
    type: ModalAddActionsTypes.CLEAR,
});


export {
    set_purchase_order,
    update_purchase_order,
    add_purchase_order_products,
    remove_purchase_order_products,
    set_step,
    clear,
    back_step,
    next_step,
    set_purchase_order_products_qty,
    set_purchase_order_products_price,
    set_purchase_order_products_price_manual
}
