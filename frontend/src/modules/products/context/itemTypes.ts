import type { IPartialInput } from "interfaces/inputs";
import type { IPartialItem } from "interfaces/item";
import type { IPartialProduct } from "interfaces/product";
import type { IPartialProductDiscountRange } from "interfaces/product-discounts-ranges";
import type { IPartialProductInput } from "interfaces/productsInputs";

interface ItemState {
    total_steps: number;
    current_step: number;
    data: IPartialItem;
    draft: IPartialItem;
};

interface ItemCommands {
    refetch: () => Promise<void>;
    reset: () => void;
}

const initialItemState: ItemState = {
    total_steps: 2,
    current_step: 0,
    data: {},
    draft: {},
}

const itemActionsType = {
    
    // * data
    SET_ITEM: "SET_ITEM",
    UPDATE_ITEM: "UPDATE_ITEM",
    SET_FROM_SERVER: "SET_FROM_SERVER",

    // ? data --> item == product

    SET_PRODUCT: "SET_PRODUCT",
    UPDATE_PRODUCT: "UPDATE_PRODUCT",
    ADDS_INPUTS_TO_PRODUCTS: "ADDS_INPUTS_TO_PRODUCTS",
    REMOVE_INPUTS_FROM_PRODUCTS: "REMOVE_INPUTS_FROM_PRODUCTS",
    ADDS_DISCOUNT_TO_PRODUCTS: "ADDS_DISCOUNT_TO_PRODUCTS",
    REMOVE_DISCOUNT_FROM_PRODUCTS: "REMOVE_DISCOUNT_FROM_PRODUCTS",

    // ?  data --> item == input

    SET_INPUT: "SET_INPUT",
    UPDATE_INPUT: "UPDATE_INPUT",

    // * draft

    SET_DRAFT_ITEM: "SET_DRAFT_ITEM",
    UPDATE_DRAFT_ITEM: "UPDATE_DRAFT_ITEM",

    // ? draft --> item == product

    SET_DRAFT_PRODUCT: "SET_DRAFT_PRODUCT",
    UPDATE_DRAFT_PRODUCT: "UPDATE_DRAFT_PRODUCT",
    ADDS_INPUTS_TO_DRAFT_PRODUCTS: "ADDS_INPUTS_TO_DRAFT_PRODUCTS",
    REMOVE_INPUTS_FROM_DRAFT_PRODUCTS: "REMOVE_INPUTS_FROM_DRAFT_PRODUCTS",
    ADDS_DISCOUNT_TO_DRAFT_PRODUCTS: "ADDS_DISCOUNT_TO_DRAFT_PRODUCTS",
    REMOVE_DISCOUNT_FROM_DRAFT_PRODUCTS: "REMOVE_DISCOUNT_FROM_DRAFT_PRODUCTS",

    // ? draft --> item == input

    SET_DRAFT_INPUT: "SET_DRAFT_INPUT",
    UPDATE_DRAFT_INPUT: "UPDATE_DRAFT_INPUT",

    // * steps

    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",

    // * clear
    
    CLEAR: "CLEAR",

} as const;

type ItemActionType = typeof itemActionsType[keyof typeof itemActionsType];

type ItemAction =

    // * data

    | { type: typeof itemActionsType.SET_ITEM, payload: IPartialItem }
    | { type: typeof itemActionsType.UPDATE_ITEM, payload: IPartialItem }
    | { type: typeof itemActionsType.SET_FROM_SERVER, payload: IPartialItem }

    // ? data --> item == product

    | { type: typeof itemActionsType.SET_PRODUCT, payload: IPartialProduct }
    | { type: typeof itemActionsType.UPDATE_PRODUCT, payload: IPartialProduct }
    | { type: typeof itemActionsType.ADDS_INPUTS_TO_PRODUCTS, payload: IPartialProductInput[] }
    | { type: typeof itemActionsType.REMOVE_INPUTS_FROM_PRODUCTS, payload: number[] }
    | { type: typeof itemActionsType.ADDS_DISCOUNT_TO_PRODUCTS, payload: IPartialProductDiscountRange[] }
    | { type: typeof itemActionsType.REMOVE_DISCOUNT_FROM_PRODUCTS, payload: number[] }

    // ? data --> item == input

    | { type: typeof itemActionsType.SET_INPUT, payload: IPartialInput }
    | { type: typeof itemActionsType.UPDATE_INPUT, payload: IPartialInput }

    // * draft

    | { type: typeof itemActionsType.SET_DRAFT_ITEM, payload: IPartialItem }
    | { type: typeof itemActionsType.UPDATE_DRAFT_ITEM, payload: IPartialItem }

    // ? draft --> item == product

    | { type: typeof itemActionsType.SET_DRAFT_PRODUCT, payload: IPartialProduct }
    | { type: typeof itemActionsType.UPDATE_DRAFT_PRODUCT, payload: IPartialProduct }
    | { type: typeof itemActionsType.ADDS_INPUTS_TO_DRAFT_PRODUCTS, payload: IPartialProductInput[] }
    | { type: typeof itemActionsType.REMOVE_INPUTS_FROM_DRAFT_PRODUCTS, payload: number[] }
    | { type: typeof itemActionsType.ADDS_DISCOUNT_TO_DRAFT_PRODUCTS, payload: IPartialProductDiscountRange[] }
    | { type: typeof itemActionsType.REMOVE_DISCOUNT_FROM_DRAFT_PRODUCTS, payload: number[] }

    // ? draft --> item == input

    | { type: typeof itemActionsType.SET_DRAFT_INPUT, payload: IPartialInput }
    | { type: typeof itemActionsType.UPDATE_DRAFT_INPUT, payload: IPartialInput }

    // * steps

    | { type: typeof itemActionsType.SET_STEP, payload: number }
    | { type: typeof itemActionsType.BACK_STEP }
    | { type: typeof itemActionsType.NEXT_STEP }

    // * clear

    | { type: typeof itemActionsType.CLEAR };

export type {
    ItemState,
    ItemAction,
    ItemActionType,
    ItemCommands,
}

export {
    itemActionsType,
    initialItemState,
}
