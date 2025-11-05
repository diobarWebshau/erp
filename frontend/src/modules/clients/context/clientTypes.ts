import type { IPartialClient } from "../../../interfaces/clients";
import type { IClientAddress } from "../../../interfaces/clientAddress";
import type { IPartialProductDiscountClient } from "../../../interfaces/product-discounts-clients";

interface ClientState {
    total_steps: number,
    current_step: number,
    data: IPartialClient,
    draft: IPartialClient,
}

type ClientCommands = {
    refetch: () => Promise<void>;
    reset: () => void;
}

const initialClientState: ClientState = {
    total_steps: 2,
    current_step: 0,
    data: {
        pruduct_discounts_client: [],
        addresses: []
    },
    draft: {
        addresses: [],
        pruduct_discounts_client: []
    },
}

const clientActionsTypes = {
    // DATA
    SET_CLIENT: "SET_CLIENT",
    UPDATE_CLIENT: "UPDATE_CLIENT",
    SET_FROM_SERVER: "SET_FROM_SERVER",
    ADD_CLIENT_ADDRESSES: "ADD_CLIENT_ADDRESSES",
    REMOVE_CLIENT_ADDRESSES: "REMOVE_CLIENT_ADDRESSES",
    UPDATE_CLIENT_ADDRESSES: "UPDATE_CLIENT_ADDRESSES",
    ADD_CLIENT_PRODUCT_DISCOUNTS: "ADD_CLIENT_PRODUCT_DISCOUNTS",
    REMOVE_CLIENT_PRODUCT_DISCOUNTS: "REMOVE_CLIENT_PRODUCT_DISCOUNTS",
    UPDATE_CLIENT_PRODUCT_DISCOUNTS: "UPDATE_CLIENT_PRODUCT_DISCOUNTS",
    // DRAFT
    SET_DRAFT_CLIENT: "SET_DRAFT_CLIENT",
    UPDATE_DRAFT_CLIENT: "UPDATE_DRAFT_CLIENT",
    ADD_DRAFT_CLIENT_ADDRESSES: "ADD_DRAFT_CLIENT_ADDRESSES",
    REMOVE_DRAFT_CLIENT_ADDRESSES: "REMOVE_DRAFT_CLIENT_ADDRESSES",
    UPDATE_DRAFT_CLIENT_ADDRESSES: "UPDATE_DRAFT_CLIENT_ADDRESSES",
    ADD_DRAFT_CLIENT_PRODUCT_DISCOUNTS: "ADD_DRAFT_CLIENT_PRODUCT_DISCOUNTS",
    REMOVE_DRAFT_CLIENT_PRODUCT_DISCOUNTS: "REMOVE_DRAFT_CLIENT_PRODUCT_DISCOUNTS",
    UPDATE_DRAFT_CLIENT_PRODUCT_DISCOUNTS: "UPDATE_DRAFT_CLIENT_PRODUCT_DISCOUNTS",
    // STEPS
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    // CLEAR
    CLEAR: "CLEAR",
} as const;


type ClientActionType = typeof clientActionsTypes[keyof typeof clientActionsTypes];

type ClientAction =
    // DATA
    | { type: typeof clientActionsTypes.SET_CLIENT, payload: IPartialClient }
    | { type: typeof clientActionsTypes.UPDATE_CLIENT, payload: IPartialClient }
    | { type: typeof clientActionsTypes.SET_FROM_SERVER, payload: IPartialClient }
    | { type: typeof clientActionsTypes.ADD_CLIENT_ADDRESSES, payload: IClientAddress[] }
    | { type: typeof clientActionsTypes.REMOVE_CLIENT_ADDRESSES, payload: (number | string)[] }
    | { type: typeof clientActionsTypes.UPDATE_CLIENT_ADDRESSES, payload: { id: number | string, attributes: IClientAddress } }
    | { type: typeof clientActionsTypes.ADD_CLIENT_PRODUCT_DISCOUNTS, payload: IPartialProductDiscountClient[] }
    | { type: typeof clientActionsTypes.REMOVE_CLIENT_PRODUCT_DISCOUNTS, payload: (number | string)[] }
    | { type: typeof clientActionsTypes.UPDATE_CLIENT_PRODUCT_DISCOUNTS, payload: { id: number | string, attributes: IPartialProductDiscountClient } }
    // DRAFT
    | { type: typeof clientActionsTypes.SET_DRAFT_CLIENT, payload: IPartialClient }
    | { type: typeof clientActionsTypes.UPDATE_DRAFT_CLIENT, payload: IPartialClient }
    | { type: typeof clientActionsTypes.ADD_DRAFT_CLIENT_ADDRESSES, payload: IClientAddress[] }
    | { type: typeof clientActionsTypes.REMOVE_DRAFT_CLIENT_ADDRESSES, payload: (number | string)[] }
    | { type: typeof clientActionsTypes.UPDATE_DRAFT_CLIENT_ADDRESSES, payload: { id: number | string, attributes: IClientAddress } }
    | { type: typeof clientActionsTypes.ADD_DRAFT_CLIENT_PRODUCT_DISCOUNTS, payload: IPartialProductDiscountClient[] }
    | { type: typeof clientActionsTypes.REMOVE_DRAFT_CLIENT_PRODUCT_DISCOUNTS, payload: (number | string)[] }
    | { type: typeof clientActionsTypes.UPDATE_DRAFT_CLIENT_PRODUCT_DISCOUNTS, payload: { id: number | string, attributes: IPartialProductDiscountClient } }
    // STEPS
    | { type: typeof clientActionsTypes.SET_STEP, payload: number }
    | { type: typeof clientActionsTypes.BACK_STEP }
    | { type: typeof clientActionsTypes.NEXT_STEP }
    // CLEAR
    | { type: typeof clientActionsTypes.CLEAR };

export type {
    ClientState,
    ClientAction,
    ClientActionType,
    ClientCommands,
};

export {
    clientActionsTypes,
    initialClientState,
};
