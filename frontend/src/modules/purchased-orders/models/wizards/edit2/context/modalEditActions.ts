import type {
    IPartialPurchasedOrder
} from "../../../../../../interfaces/purchasedOrder";
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../interfaces/purchasedOrdersProducts";
import type {
    ModalEditAction,
} from "./modalEditTypes";
import {
    ModalEditActionsTypes,
} from "./modalEditTypes";

// * ************ Acciones globales  ************/

const set_purchase_order = (
    payload: IPartialPurchasedOrder
): ModalEditAction => ({
    type: ModalEditActionsTypes.SET_PURCHASE_ORDER,
    payload
});

const update_purchase_order = (
    payload: IPartialPurchasedOrder
): ModalEditAction => ({
    type: ModalEditActionsTypes.UPDATE_PURCHASE_ORDER,
    payload
});


const set_update_data = (
    payload: IPartialPurchasedOrder
): ModalEditAction => ({
    type: ModalEditActionsTypes.SET_UPDATE_DATA,
    payload
});

const reset_update_data = (): ModalEditAction => ({
    type: ModalEditActionsTypes.RESET_UPDATE_DATA,
});

const update_update_data = (
    payload: IPartialPurchasedOrder
): ModalEditAction => ({
    type: ModalEditActionsTypes.UPDATE_UPDATE_DATA,
    payload
});

const update_sync_data = (
    payload: IPartialPurchasedOrder
): ModalEditAction => ({
    type: ModalEditActionsTypes.UPDATE_SYNC_DATA,
    payload
});


// * ************ Acciones de productos  ************/

const add_purchase_order_products = (
    payload: IPartialPurchasedOrderProduct[]
): ModalEditAction => ({
    type: ModalEditActionsTypes.ADD_PURCHASE_ORDER_PRODUCTS,
    payload
});

const remove_purchase_order_products = (
    payload: IPartialPurchasedOrderProduct
): ModalEditAction => ({
    type: ModalEditActionsTypes.REMOVE_PURCHASE_ORDER_PRODUCTS,
    payload
});

const set_purchase_order_products_qty = (
    payload: {id: number, qty: number}
): ModalEditAction => ({
    type: ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_QTY,
    payload
});

const set_purchase_order_products_price = (
    payload: {id: number, recorded_price: number}
): ModalEditAction => ({
    type: ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE,
    payload
});

const set_purchase_order_products_price_manual = (
    payload: {id: number, was_price_edited_manually: boolean | null}
): ModalEditAction => ({
    type: ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL,
    payload
});

// * ************ Acciones de steps del wizard  ************/

const set_step = (
    payload: number
): ModalEditAction    => ({
    type: ModalEditActionsTypes.SET_STEP,
    payload
});

const back_step = (): ModalEditAction => ({
    type: ModalEditActionsTypes.BACK_STEP,
});

const next_step = (): ModalEditAction => ({
    type: ModalEditActionsTypes.NEXT_STEP,
});


// * ************ Acciones de clear  ************/

const clear = (): ModalEditAction => ({
    type: ModalEditActionsTypes.CLEAR,
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
    set_purchase_order_products_price_manual,
    set_update_data,
    reset_update_data,
    update_update_data,
    update_sync_data
}
