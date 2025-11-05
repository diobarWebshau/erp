import { clientActionsTypes } from "./../context/clientTypes";
import type { ClientAction } from "./../context/clientTypes";
import type { IPartialClient } from "../../../interfaces/clients";
import type { IClientAddress } from "../../../interfaces/clientAddress";
import type { IPartialProductDiscountClient } from "../../../interfaces/product-discounts-clients";

// DATA

const set_client = (payload: IPartialClient): ClientAction => ({
    type: clientActionsTypes.SET_CLIENT,
    payload
});

const update_client = (payload: IPartialClient): ClientAction => ({
    type: clientActionsTypes.UPDATE_CLIENT,
    payload
});

const set_from_server = (payload: IPartialClient): ClientAction => ({
    type: clientActionsTypes.SET_FROM_SERVER,
    payload
});

const add_client_addresses = (payload: IClientAddress[]): ClientAction => ({
    type: clientActionsTypes.ADD_CLIENT_ADDRESSES,
    payload
});

const remove_client_addresses = (payload: (number | string)[]): ClientAction => ({
    type: clientActionsTypes.REMOVE_CLIENT_ADDRESSES,
    payload
});

const update_client_addresses = (payload: { id: number | string; attributes: IClientAddress }): ClientAction => ({
    type: clientActionsTypes.UPDATE_CLIENT_ADDRESSES,
    payload
});

const add_client_product_discounts = (payload: IPartialProductDiscountClient[]): ClientAction => ({
    type: clientActionsTypes.ADD_CLIENT_PRODUCT_DISCOUNTS,
    payload
});

const remove_client_product_discounts = (payload: (number | string)[]): ClientAction => ({
    type: clientActionsTypes.REMOVE_CLIENT_PRODUCT_DISCOUNTS,
    payload
});

const update_client_product_discounts = (payload: { id: number | string; attributes: IPartialProductDiscountClient }): ClientAction => ({
    type: clientActionsTypes.UPDATE_CLIENT_PRODUCT_DISCOUNTS,
    payload
});

// DRAFT

const set_draft_client = (payload: IPartialClient): ClientAction => ({
    type: clientActionsTypes.SET_DRAFT_CLIENT,
    payload
});

const update_draft_client = (payload: IPartialClient): ClientAction => ({
    type: clientActionsTypes.UPDATE_DRAFT_CLIENT,
    payload
});

const add_draft_client_addresses = (payload: IClientAddress[]): ClientAction => ({
    type: clientActionsTypes.ADD_DRAFT_CLIENT_ADDRESSES,
    payload
});

const remove_draft_client_addresses = (payload: (number | string)[]): ClientAction => ({
    type: clientActionsTypes.REMOVE_DRAFT_CLIENT_ADDRESSES,
    payload
});

const update_draft_client_addresses = (payload: { id: number | string; attributes: IClientAddress }): ClientAction => ({
    type: clientActionsTypes.UPDATE_DRAFT_CLIENT_ADDRESSES,
    payload
});

const add_draft_client_product_discounts = (payload: IPartialProductDiscountClient[]): ClientAction => ({
    type: clientActionsTypes.ADD_DRAFT_CLIENT_PRODUCT_DISCOUNTS,
    payload
});

const remove_draft_client_product_discounts = (payload: (number | string)[]): ClientAction => ({
    type: clientActionsTypes.REMOVE_DRAFT_CLIENT_PRODUCT_DISCOUNTS,
    payload
});

const update_draft_client_product_discounts = (payload: { id: number | string; attributes: IPartialProductDiscountClient }): ClientAction => ({
    type: clientActionsTypes.UPDATE_DRAFT_CLIENT_PRODUCT_DISCOUNTS,
    payload
});

// STEPS

const set_step = (payload: number): ClientAction => ({
    type: clientActionsTypes.SET_STEP,
    payload
});

const back_step = (): ClientAction => ({
    type: clientActionsTypes.BACK_STEP
});

const next_step = (): ClientAction => ({
    type: clientActionsTypes.NEXT_STEP
});

// CLEAR

const clear = (): ClientAction => ({
    type: clientActionsTypes.CLEAR
});

export {
    set_client,
    update_client,
    set_from_server,
    add_client_addresses,
    remove_client_addresses,
    update_client_addresses,
    add_client_product_discounts,
    remove_client_product_discounts,
    update_client_product_discounts,
    set_draft_client,
    update_draft_client,
    add_draft_client_addresses,
    remove_draft_client_addresses,
    update_draft_client_addresses,
    add_draft_client_product_discounts,
    remove_draft_client_product_discounts,
    update_draft_client_product_discounts,
    set_step,
    back_step,
    next_step,
    clear
}
