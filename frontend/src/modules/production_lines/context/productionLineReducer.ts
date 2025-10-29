import { produce, type Draft } from "immer";
import { productionLineActionsTypes, type ProductionLineAction, type ProductionLineState } from "./productionLineTypes";

const productionLineReducer = produce((draft: Draft<ProductionLineState>, action: ProductionLineAction) => {

    switch (action.type) {
        // todo: Data
        case productionLineActionsTypes.SET_PRODUCTION_LINE: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case productionLineActionsTypes.UPDATE_PRODUCTION_LINE: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case productionLineActionsTypes.SET_FROM_SERVER: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case productionLineActionsTypes.ADD_PRODUCTION_LINE_PRODUCTS: {
            for (const item of action.payload) {
                if (draft.data?.production_lines_products?.length === 0) {
                    const isDuplicate = draft.data?.production_lines_products?.some(
                        it => it.id === item.id
                    );
                    if (isDuplicate) return;
                }
                draft.data.production_lines_products?.push(item);
            }
            break;
        }
        case productionLineActionsTypes.REMOVE_PRODUCTION_LINE_PRODUCTS: {
            if (!draft.data?.production_lines_products) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.data.production_lines_products =
                draft.data.production_lines_products.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case productionLineActionsTypes.UPDATE_PRODUCTION_LINE_PRODUCTS: {
            if (!draft.data?.production_lines_products) break;
            const target = draft.data.production_lines_products.find(
                it => it.id === action.payload.id
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        // todo:  Draft
        case productionLineActionsTypes.SET_DRAFT_PRODUCTION_LINE: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        case productionLineActionsTypes.UPDATE_DRAFT_PRODUCTION_LINE: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        case productionLineActionsTypes.ADD_DRAFT_PRODUCTION_LINE_PRODUCTS: {
            for (const item of action.payload) {
                if (draft.draft?.production_lines_products?.length === 0) {
                    const isDuplicate = draft.draft?.production_lines_products?.some(
                        it => it.id === item.id
                    );
                    if (isDuplicate) return;
                }
                draft.draft.production_lines_products?.push(item);
            }
            break;
        }
        case productionLineActionsTypes.REMOVE_DRAFT_PRODUCTION_LINE_PRODUCTS: {
            if (!draft.draft?.production_lines_products) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.draft.production_lines_products =
                draft.draft.production_lines_products.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case productionLineActionsTypes.UPDATE_DRAFT_PRODUCTION_LINE_PRODUCTS: {
            if (!draft.draft?.production_lines_products) break;
            const target = draft.draft.production_lines_products.find(
                it => it.id === action.payload.id
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        // Steps
        case productionLineActionsTypes.SET_STEP: {
            draft.current_step = action.payload;
            break;
        }
        case productionLineActionsTypes.BACK_STEP: {
            draft.current_step -= 1;
            break;
        }
        case productionLineActionsTypes.NEXT_STEP: {
            draft.current_step += 1;
            break;
        }
        // Clear
        case productionLineActionsTypes.CLEAR: {
            draft.data = {};
            break;
        }
    }

});

export default productionLineReducer;



