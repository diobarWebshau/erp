import type { Draft } from "immer";
import { produce } from "immer";
import type { ShippingOrderState, ShippingOrderAction } from "./shippingOrderTypes";
import { shippingOrderActionsTypes } from "./shippingOrderTypes";

const inventoriesReducer = produce((
    draft: Draft<ShippingOrderState>,
    action: ShippingOrderAction) => {

    switch (action.type) {

        // ? Acciones directas al objeto de shipping order
        case shippingOrderActionsTypes.SET_SHIPPING_ORDER:
            Object.assign(draft.data, action.payload);
            break;
        case shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER:
            Object.assign(draft.data, action.payload);
            break;
        case shippingOrderActionsTypes.SET_FROM_SERVER:
            Object.assign(draft.data, action.payload);
            break;
        // ? Acciones directas al array de shipping order purchased order products
        case shippingOrderActionsTypes.ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS:
            for (const item of action.payload) {
                if (draft.data?.shipping_order_purchase_order_product?.length === 0) {
                    const isDuplicate = draft.data?.shipping_order_purchase_order_product?.some(
                        it => it.id === item.id
                    );
                    if (isDuplicate) return;
                }
                draft.data.shipping_order_purchase_order_product?.push(item);
            }
            break;
        case shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: {
            if (!draft.data?.shipping_order_purchase_order_product) return;
            const idsToRemove = new Set<string | number>(action.payload as (string | number)[]); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.data.shipping_order_purchase_order_product =
                draft.data.shipping_order_purchase_order_product.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: {
            if (!draft.data?.shipping_order_purchase_order_product) break;
            const target = draft.data.shipping_order_purchase_order_product.find(
                it => it.id === action.payload.id
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        case shippingOrderActionsTypes.ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX:
            for (const item of action.payload) {
                if (draft.data?.shipping_order_purchase_order_product_aux?.length === 0) {
                    const isDuplicate = draft.data?.shipping_order_purchase_order_product_aux?.some(
                        it => it.id === item.id
                    );
                    if (isDuplicate) return;
                }
                draft.data.shipping_order_purchase_order_product_aux?.push(item);
            }
            break;
        case shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: {
            if (!draft.data?.shipping_order_purchase_order_product_aux) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.data.shipping_order_purchase_order_product_aux =
                draft.data.shipping_order_purchase_order_product_aux.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: {
            if (!draft.data?.shipping_order_purchase_order_product_aux) break;
            const target = draft.data.shipping_order_purchase_order_product_aux.find(
                it => it.id === action.payload.id
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        // ? Acciones directas al objeto de shipping order
        case shippingOrderActionsTypes.SET_DRAFT_SHIPPING_ORDER:
            Object.assign(draft.draft, action.payload);
            break;
        case shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER:
            Object.assign(draft.draft, action.payload);
            break;
        // ? Acciones directas al array de shipping order purchased order products
        case shippingOrderActionsTypes.ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS:
            for (const item of action.payload) {
                if (draft.draft?.shipping_order_purchase_order_product?.length === 0) {
                    const isDuplicate = draft.draft?.shipping_order_purchase_order_product?.some(
                        it => it.id === item.id
                    );
                    if (isDuplicate) return;
                }
                draft.draft.shipping_order_purchase_order_product?.push(item);
            }
            break;
        case shippingOrderActionsTypes.REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: {
            if (!draft.draft?.shipping_order_purchase_order_product) return;
            const idsToRemove = new Set<string | number>(action.payload as (string | number)[]); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.draft.shipping_order_purchase_order_product =
                draft.draft.shipping_order_purchase_order_product.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: {
            if (!draft.draft?.shipping_order_purchase_order_product) break;
            const target = draft.draft.shipping_order_purchase_order_product.find(
                it => it.id === action.payload.id
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        case shippingOrderActionsTypes.ADD_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX:
            for (const item of action.payload) {
                if (draft.draft?.shipping_order_purchase_order_product_aux?.length === 0) {
                    const isDuplicate = draft.draft?.shipping_order_purchase_order_product_aux?.some(
                        it => it.id === item.id
                    );
                    if (isDuplicate) return;
                }
                draft.draft.shipping_order_purchase_order_product_aux?.push(item);
            }
            break;
        case shippingOrderActionsTypes.REMOVE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: {
            if (!draft.draft?.shipping_order_purchase_order_product_aux) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.draft.shipping_order_purchase_order_product_aux =
                draft.draft.shipping_order_purchase_order_product_aux.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case shippingOrderActionsTypes.UPDATE_DRAFT_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS_AUX: {
            if (!draft.draft?.shipping_order_purchase_order_product_aux) break;
            const target = draft.draft.shipping_order_purchase_order_product_aux.find(
                it => it.id === action.payload.id
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        // ? Acciones de los steps
        case shippingOrderActionsTypes.SET_STEP:
            draft.current_step = action.payload;
            break;
        case shippingOrderActionsTypes.BACK_STEP:
            draft.current_step -= 1;
            break;
        case shippingOrderActionsTypes.NEXT_STEP:
            draft.current_step += 1;
            break;
        case shippingOrderActionsTypes.CLEAR:
            draft.data = {};
            break;
    }

});

export default inventoriesReducer;
