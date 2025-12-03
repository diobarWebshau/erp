import type {
    IPartialPurchasedOrder
} from "../../../../../../../interfaces/purchasedOrder";
import type {
    IPartialPurchasedOrderProduct
} from "../../../../../../../interfaces/purchasedOrdersProducts";


const total_steps = 3;

type ModalAddState = {
    total_steps: number,
    current_step: number,
    data: IPartialPurchasedOrder,
}

const ModalAddActionsTypes = {
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
} as const;

type ModalAddActionType =
    typeof ModalAddActionsTypes[keyof typeof ModalAddActionsTypes];

type ModalAddAction =
    | { type: typeof ModalAddActionsTypes.SET_PURCHASE_ORDER, payload: IPartialPurchasedOrder }
    | { type: typeof ModalAddActionsTypes.UPDATE_PURCHASE_ORDER, payload: IPartialPurchasedOrder }
    | { type: typeof ModalAddActionsTypes.ADD_PURCHASE_ORDER_PRODUCTS, payload: IPartialPurchasedOrderProduct[] }
    | { type: typeof ModalAddActionsTypes.REMOVE_PURCHASE_ORDER_PRODUCTS, payload: IPartialPurchasedOrderProduct }
    | { type: typeof ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_QTY, payload: {id: number, qty: number} }
    | { type: typeof ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE, payload: {id: number, recorded_price: number} }
    | { type: typeof ModalAddActionsTypes.SET_PURCHASE_ORDER_PRODUCTS_PRICE_MANUAL, payload: {id: number, was_price_edited_manually: boolean | null} }
    | { type: typeof ModalAddActionsTypes.SET_STEP, payload: number }
    | { type: typeof ModalAddActionsTypes.BACK_STEP }
    | { type: typeof ModalAddActionsTypes.NEXT_STEP }
    | { type: typeof ModalAddActionsTypes.CLEAR }

export type {
    ModalAddState,
    ModalAddActionType,
    ModalAddAction
};

export {
    ModalAddActionsTypes,
    total_steps
};





