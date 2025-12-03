import type {
    IPartialPurchasedOrder
} from "../../../../../../../interfaces/purchasedOrder";
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../../interfaces/purchasedOrdersProducts";

const total_steps = 4;

type ModalEditState = {
    total_steps: number,
    current_step: number,
    data: IPartialPurchasedOrder,
    updated: IPartialPurchasedOrder
}

const ModalEditActionsTypes = {
    SET_PURCHASE_ORDER: "SET_PURCHASE_ORDER",
    UPDATE_PURCHASE_ORDER: "UPDATE_PURCHASE_ORDER",
    ADD_PURCHASE_ORDER_PRODUCTS: "ADD_PURCHASE_ORDER_PRODUCTS",
    REMOVE_PURCHASE_ORDER_PRODUCTS: "REMOVE_PURCHASE_ORDER_PRODUCTS",
    SET_PURCHASE_ORDER_PRODUCTS_QTY: "SET_PURCHASE_ORDER_PRODUCTS_QTY",
    SET_PURCHASE_ORDER_PRODUCTS_PRICE: "SET_PURCHASE_ORDER_PRODUCTS_PRICE",
    SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL: "SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL",
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    CLEAR: "CLEAR",
    SET_UPDATE_DATA: "SET_UPDATE_DATA",
    RESET_UPDATE_DATA: "RESET_UPDATE_DATA",
    UPDATE_UPDATE_DATA: "UPDATE_UPDATE_DATA",
    UPDATE_SYNC_DATA: "UPDATE_SYNC_DATA"
} as const;

type ModalEditActionType =
    typeof ModalEditActionsTypes[keyof typeof ModalEditActionsTypes];

type ModalEditAction =
    | { type: typeof ModalEditActionsTypes.SET_PURCHASE_ORDER, payload: IPartialPurchasedOrder }
    | { type: typeof ModalEditActionsTypes.UPDATE_PURCHASE_ORDER, payload: IPartialPurchasedOrder }
    | { type: typeof ModalEditActionsTypes.ADD_PURCHASE_ORDER_PRODUCTS, payload: IPartialPurchasedOrderProduct[] }
    | { type: typeof ModalEditActionsTypes.REMOVE_PURCHASE_ORDER_PRODUCTS, payload: IPartialPurchasedOrderProduct }
    | { type: typeof ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_QTY, payload: {id: number, qty: number} }
    | { type: typeof ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE, payload: {id: number, recorded_price: number} }
    | { type: typeof ModalEditActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL, payload: {id: number, was_price_edited_manually: boolean | null} }
    | { type: typeof ModalEditActionsTypes.SET_STEP, payload: number }
    | { type: typeof ModalEditActionsTypes.BACK_STEP }
    | { type: typeof ModalEditActionsTypes.NEXT_STEP }
    | { type: typeof ModalEditActionsTypes.CLEAR }
    | { type: typeof ModalEditActionsTypes.SET_UPDATE_DATA, payload: IPartialPurchasedOrder}
    | { type: typeof ModalEditActionsTypes.RESET_UPDATE_DATA }
    | { type: typeof ModalEditActionsTypes.UPDATE_UPDATE_DATA, payload: IPartialPurchasedOrder}
    | { type: typeof ModalEditActionsTypes.UPDATE_SYNC_DATA, payload: IPartialPurchasedOrder}

export type {
    ModalEditState,
    ModalEditActionType,
    ModalEditAction
};

export {
    ModalEditActionsTypes,
    total_steps
};





