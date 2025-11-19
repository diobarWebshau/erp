import type { IProduct } from "interfaces/product";
import type { ItemState, ItemAction } from "./itemTypes";
import { itemActionsType } from "./itemTypes";
import { produce } from "immer";
import type { Draft } from "immer";

const itemReducer = produce((draft: Draft<ItemState>, action: ItemAction) => {
    switch (action.type) {
        // * data
        case itemActionsType.SET_ITEM: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case itemActionsType.UPDATE_ITEM: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case itemActionsType.SET_FROM_SERVER: {
            Object.assign(draft.data, action.payload);
            break;
        }
        // ? data --> item == product
        case itemActionsType.ADDS_INPUTS_TO_PRODUCTS: {
            const item = draft.data.item as IProduct;
            if (!item.products_inputs) item.products_inputs = [];
            item.products_inputs.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_INPUTS_FROM_PRODUCTS: {
            const item = draft.data.item as IProduct;
            if (!item.products_inputs || item.products_inputs?.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.products_inputs = item.products_inputs.filter(it => {
                const id = it.id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        case itemActionsType.ADDS_DISCOUNT_TO_PRODUCTS: {
            const item = draft.data.item as IProduct;
            if (!item.product_discount_ranges) item.product_discount_ranges = [];
            item.product_discount_ranges.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_DISCOUNT_FROM_PRODUCTS: {
            const item = draft.data.item as IProduct;
            if (!item.product_discount_ranges || item.product_discount_ranges?.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.product_discount_ranges = item.product_discount_ranges.filter(it => {
                const id = it.id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        // ? data -> item == input
        case itemActionsType.SET_INPUT: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case itemActionsType.UPDATE_INPUT: {
            Object.assign(draft.data, action.payload);
            break;
        }
        // * draft
        case itemActionsType.SET_DRAFT_ITEM: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        case itemActionsType.UPDATE_DRAFT_ITEM: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        // ? draft --> item == product
        case itemActionsType.ADDS_INPUTS_TO_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IProduct;
            if (!item.products_inputs) item.products_inputs = [];
            item.products_inputs.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_INPUTS_FROM_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IProduct;
            if (!item.products_inputs || item.products_inputs?.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.products_inputs = item.products_inputs.filter(it => {
                const id = it.id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        case itemActionsType.ADDS_DISCOUNT_TO_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IProduct;
            if (!item.product_discount_ranges) item.product_discount_ranges = [];
            item.product_discount_ranges.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_DISCOUNT_FROM_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IProduct;
            if (!item.product_discount_ranges || item.product_discount_ranges?.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.product_discount_ranges = item.product_discount_ranges.filter(it => {
                const id = it.id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        // ? draft --> item == input
        case itemActionsType.SET_DRAFT_INPUT: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        case itemActionsType.UPDATE_DRAFT_INPUT: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        // * steps
        case itemActionsType.SET_STEP: {
            draft.current_step = action.payload;
            break;
        }
        case itemActionsType.BACK_STEP: {
            draft.current_step--;
            break;
        }
        case itemActionsType.NEXT_STEP: {
            draft.current_step++;
            break;
        }
        // * clear
        case itemActionsType.CLEAR: {
            draft.data = {};
            draft.draft = {};
            draft.current_step = 0;
            break;
        }
        default: {
            break;
        }
    };
})


export default itemReducer;
