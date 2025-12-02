import type { IPartialProductProcess } from "../../../interfaces/productsProcesses";
import type { IPartialProduct } from "../../../interfaces/product";
import type { ItemState, ItemAction } from "./itemTypes";
import { itemActionsType } from "./itemTypes";
import type { Draft } from "immer";
import { current, produce } from "immer";

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
        case itemActionsType.SET_PRODUCT: {
            draft.data.item = action.payload;
            break;
        }
        case itemActionsType.UPDATE_PRODUCT: {
            const product = draft.data.item as IPartialProduct
            draft.data.item = {
                ...product,
                ...action.payload,
                product_discount_ranges: action.payload.product_discount_ranges
                    ? [...action.payload.product_discount_ranges]
                    : product.product_discount_ranges,
                product_processes: action.payload.product_processes
                    ? [...action.payload.product_processes]
                    : product.product_processes,
                products_inputs: action.payload.products_inputs
                    ? [...action.payload.products_inputs]
                    : product.products_inputs,
            };
            break;
        }
        case itemActionsType.ADDS_INPUTS_TO_PRODUCTS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.products_inputs) item.products_inputs = [];
            item.products_inputs.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_INPUTS_FROM_PRODUCTS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.products_inputs || item.products_inputs.length === 0) return;
            const idsToRemove = new Set(action.payload.map(id => String(id)));
            item.products_inputs = item.products_inputs.filter(it => {
                if (it.id == null) return true;
                return !idsToRemove.has(String(it.id));
            });
            break;
        }
        case itemActionsType.UPDATE_INPUTS_FROM_PRODUCTS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.products_inputs?.length) return;
            const { id, attributes } = action.payload;
            const input = item.products_inputs.find(it => it.id === id);
            if (input) {
                Object.assign(input, attributes); // ok siempre que attributes sea plano
                console.log("NEW STATE AFTER UPDATE", current(draft.data.item));
                const withoutItem = item.products_inputs.filter(pi => pi.id !== id);
                withoutItem.push(input);
                item.products_inputs = [...withoutItem];
            }
            break;
        }
        case itemActionsType.ADDS_PRODUCT_PROCESS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.product_processes) {
                item.product_processes = [];
            }
            action.payload.forEach((it) => {
                const process: IPartialProductProcess = {
                    ...it,
                    sort_order: (item.product_processes?.length ?? 0) + 1,
                };
                item.product_processes?.push(process);
            });
            break;
        }
        case itemActionsType.REMOVE_PRODUCT_PROCESS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.product_processes || item.product_processes.length === 0) return;
            const idsToRemove = new Set(action.payload.map(id => String(id)));
            item.product_processes = item.product_processes.filter(it => {
                if (!it.id) return true;
                return !idsToRemove.has(String(it.id));
            });
            break;
        }
        case itemActionsType.UPDATE_PRODUCT_PROCESS: {
            const item = draft.data.item as IPartialProduct;
            item.product_processes = action.payload;
            break;
        }
        case itemActionsType.UPDATE_PRODUCT_PROCESS_ID: {
            const item = draft.data.item as IPartialProduct;
            console.log(`product_process`,current(item.product_processes));
            if (!item.product_processes || item.product_processes?.length === 0) return;
            const { id, attributes } = action.payload;
            console.log('id', id)
            console.log('attributes', attributes)
            const product_process = item.product_processes.find(it => it.id === id);
            if (product_process) {
                Object.assign(product_process, attributes);
            }
            console.log((product_process));
            break;
        }
        case itemActionsType.ADDS_DISCOUNT_TO_PRODUCTS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.product_discount_ranges) item.product_discount_ranges = [];
            item.product_discount_ranges.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_DISCOUNT_FROM_PRODUCTS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.product_discount_ranges || item.product_discount_ranges?.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.product_discount_ranges = item.product_discount_ranges.filter(it => {
                if (it.id == null) return true;
                return !idsToRemove.has(String(it.id));
            });
            break;
        }
        case itemActionsType.UPDATE_DISCOUNT_FROM_PRODUCTS: {
            const item = draft.data.item as IPartialProduct;
            if (!item.product_discount_ranges || item.product_discount_ranges?.length === 0) return;
            const { id, attributes } = action.payload;
            const discount = item.product_discount_ranges.find(it => it.id === id);
            if (discount) {
                Object.assign(discount, attributes);
            }
            break;
        }
        // ? data -> item == input
        case itemActionsType.SET_INPUT: {
            draft.data.item = action.payload;
            break;
        }
        case itemActionsType.UPDATE_INPUT: {
            const product = draft.data.item as IPartialProduct;
            draft.data.item = {
                ...product,
                ...action.payload,
            }
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

        case itemActionsType.SET_DRAFT_PRODUCT: {
            draft.draft.item = action.payload;
            break;
        }
        case itemActionsType.UPDATE_DRAFT_PRODUCT: {
            const product = draft.draft.item as IPartialProduct
            draft.data.item = {
                ...product,
                ...action.payload,
                product_discount_ranges: action.payload.product_discount_ranges
                    ? [...action.payload.product_discount_ranges]
                    : product.product_discount_ranges,
                product_processes: action.payload.product_processes
                    ? [...action.payload.product_processes]
                    : product.product_processes,
                products_inputs: action.payload.products_inputs
                    ? [...action.payload.products_inputs]
                    : product.products_inputs,
            };
            break;
        }
        case itemActionsType.ADDS_INPUTS_TO_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.products_inputs) item.products_inputs = [];
            item.products_inputs.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_INPUTS_FROM_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.products_inputs || item.products_inputs?.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.products_inputs = item.products_inputs.filter(it => {
                const id = it.id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        case itemActionsType.ADDS_DRAFT_PRODUCT_PROCESS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.product_processes) {
                item.product_processes = [];
            }
            action.payload.forEach((it) => {
                const process: IPartialProductProcess = {
                    ...it,
                    sort_order: (item.product_processes?.length ?? 0) + 1,
                };
                item.product_processes?.push(process);
            });
            break;
        }
        case itemActionsType.REMOVE_DRAFT_PRODUCT_PROCESS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.product_processes || item.product_processes.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.product_processes = item.product_processes.filter(it => {
                const id = it.id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        case itemActionsType.UPDATE_DRAFT_PRODUCT_PROCESS: {
            const item = draft.draft.item as IPartialProduct;
            item.product_processes = action.payload;
            break;
        }
        case itemActionsType.UPDATE_DRAFT_PRODUCT_PROCESS_ID: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.product_processes || item.product_processes?.length === 0) return;
            const { id, attributes } = action.payload;
            const product_process = item.product_processes.find(it => it.id === id);
            if (product_process) {
                Object.assign(product_process, attributes);
            }
            break;
        }
        case itemActionsType.UPDATE_INPUTS_FROM_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.products_inputs || item.products_inputs?.length === 0) return;
            const { id, attributes } = action.payload;
            const input = item.products_inputs.find(it => it.id === id);
            if (input) {
                Object.assign(input, attributes);
            }
            break;
        }
        case itemActionsType.ADDS_DISCOUNT_TO_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.product_discount_ranges) item.product_discount_ranges = [];
            item.product_discount_ranges.push(...action.payload);
            break;
        }
        case itemActionsType.REMOVE_DISCOUNT_FROM_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.product_discount_ranges || item.product_discount_ranges?.length === 0) return;
            const idsToRemove = new Set<string | number>(action.payload);
            item.product_discount_ranges = item.product_discount_ranges.filter(it => {
                const id = it.id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        case itemActionsType.UPDATE_DISCOUNT_FROM_DRAFT_PRODUCTS: {
            const item = draft.draft.item as IPartialProduct;
            if (!item.product_discount_ranges || item.product_discount_ranges?.length === 0) return;
            const { id, attributes } = action.payload;
            const discount = item.product_discount_ranges.find(it => it.id === id);
            if (discount) {
                Object.assign(discount, attributes);
            }
            break;
        }
        // ? draft --> item == input
        case itemActionsType.SET_DRAFT_INPUT: {
            draft.data.item = action.payload;
            break;
        }
        case itemActionsType.UPDATE_DRAFT_INPUT: {
            const product = draft.data.item as IPartialProduct;
            draft.data.item = {
                ...product,
                ...action.payload,
            }
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
