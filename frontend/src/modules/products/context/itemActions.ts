import type { ItemAction} from "./itemTypes";
import { itemActionsType } from "./itemTypes";
import type { IPartialItem } from "../../../interfaces/item";
import type { IPartialProductInput } from "interfaces/productsInputs";
import type { IPartialProduct } from "interfaces/product";
import type { IPartialProductDiscountRange } from "interfaces/product-discounts-ranges";

// * data

const set_item = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.SET_ITEM,
    payload
});

const update_item = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.UPDATE_ITEM,
    payload
});

const set_from_server = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.SET_FROM_SERVER,
    payload
});

// ? data --> item == product


const set_product = (payload: IPartialProduct): ItemAction => ({
    type: itemActionsType.SET_PRODUCT,
    payload
});

const update_product = (payload: IPartialProduct): ItemAction => ({
    type: itemActionsType.UPDATE_PRODUCT,
    payload
});



const add_inputs_to_products = (payload: IPartialProductInput[]): ItemAction => ({
    type: itemActionsType.ADDS_INPUTS_TO_PRODUCTS,
    payload
});

const remove_inputs_from_products = (payload: number[]): ItemAction => ({
    type: itemActionsType.REMOVE_INPUTS_FROM_PRODUCTS,
    payload
});

const update_inputs_from_products = (payload: {id: number, attributes: IPartialProductInput }): ItemAction => ({
    type: itemActionsType.UPDATE_INPUTS_FROM_PRODUCTS,
    payload
});



const add_discount_to_products = (payload: IPartialProductDiscountRange[]): ItemAction => ({
    type: itemActionsType.ADDS_DISCOUNT_TO_PRODUCTS,
    payload
});

const remove_discount_from_products = (payload: number[]): ItemAction => ({
    type: itemActionsType.REMOVE_DISCOUNT_FROM_PRODUCTS,
    payload
});

const update_discount_from_products = (payload: {id: number, attributes: IPartialProductDiscountRange }): ItemAction => ({
    type: itemActionsType.UPDATE_DISCOUNT_FROM_PRODUCTS,
    payload
});


// ? data --> item == input

const set_input = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.SET_INPUT,
    payload
});

const update_input = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.UPDATE_INPUT,
    payload
});

// * draft

const set_draft_item = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.SET_DRAFT_ITEM,
    payload
});

const update_draft_item = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.UPDATE_DRAFT_ITEM,
    payload
});

// ? draft --> item == product


const set_draft_product = (payload: IPartialProduct): ItemAction => ({
    type: itemActionsType.SET_DRAFT_PRODUCT,
    payload
});

const update_draft_product = (payload: IPartialProduct): ItemAction => ({
    type: itemActionsType.UPDATE_DRAFT_PRODUCT,
    payload
});



const add_inputs_to_draft_products = (payload: IPartialProductInput[]): ItemAction => ({
    type: itemActionsType.ADDS_INPUTS_TO_DRAFT_PRODUCTS,
    payload
});

const remove_inputs_from_draft_products = (payload: number[]): ItemAction => ({
    type: itemActionsType.REMOVE_INPUTS_FROM_DRAFT_PRODUCTS,
    payload
});

const update_inputs_from_draft_products = (payload: {id: number, attributes: IPartialProductInput }): ItemAction => ({
    type: itemActionsType.UPDATE_INPUTS_FROM_DRAFT_PRODUCTS,
    payload
});




const add_discount_to_draft_products = (payload: IPartialProductDiscountRange[]): ItemAction => ({
    type: itemActionsType.ADDS_DISCOUNT_TO_DRAFT_PRODUCTS,
    payload
});

const remove_discount_from_draft_products = (payload: number[]): ItemAction => ({
    type: itemActionsType.REMOVE_DISCOUNT_FROM_DRAFT_PRODUCTS,
    payload
});

const update_discount_from_draft_products = (payload: {id: number, attributes: IPartialProductDiscountRange }): ItemAction => ({
    type: itemActionsType.UPDATE_DISCOUNT_FROM_DRAFT_PRODUCTS,
    payload
});




// ? draft --> item == input

const set_draft_input = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.SET_DRAFT_INPUT,
    payload
});

const update_draft_input = (payload: IPartialItem): ItemAction => ({
    type: itemActionsType.UPDATE_DRAFT_INPUT,
    payload
});


// * steps

const set_step = (payload: number): ItemAction => ({
    type: itemActionsType.SET_STEP,
    payload
});

const back_step = (): ItemAction => ({
    type: itemActionsType.BACK_STEP
});

const next_step = (): ItemAction => ({
    type: itemActionsType.NEXT_STEP
});

// * clear

const clear = (): ItemAction => ({
    type: itemActionsType.CLEAR
});


export {

    // data 
    set_item,
    update_item,
    set_from_server,

    set_product,
    update_product,
    
    add_inputs_to_products,
    remove_inputs_from_products,
    update_inputs_from_products,
    
    add_discount_to_products,
    remove_discount_from_products,
    update_discount_from_products,
    
    set_input,
    update_input,

    // * draft
    set_draft_item,
    update_draft_item,

    set_draft_product,
    update_draft_product,

    add_inputs_to_draft_products,
    remove_inputs_from_draft_products,
    update_inputs_from_draft_products,

    add_discount_to_draft_products,
    remove_discount_from_draft_products,
    update_discount_from_draft_products,

    set_draft_input,
    update_draft_input,

    // * steps
    set_step,
    back_step,
    next_step,

    // * clear
    clear
}
