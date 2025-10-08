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
            return action.payload;
        case shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER:
            Object.assign(draft.data, action.payload);
            break;
        // ? Acciones directas al array de shipping order purchased order products
        case shippingOrderActionsTypes.ADD_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS:
            for (const item of action.payload) {
                if (draft.data?.shipping_order_purchase_order_product?.length === 0) {
                    const isDuplicate = draft.data?.shipping_order_purchase_order_product?.some(
                        it => it.purchase_order_product_id === item.purchase_order_product_id
                    );
                    if (isDuplicate) return;
                }
                draft.data.shipping_order_purchase_order_product?.push(item);
            }
            break;
        case shippingOrderActionsTypes.REMOVE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: {
            if (!draft.data?.shipping_order_purchase_order_product) return;
            const idsToRemove = new Set(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.data.shipping_order_purchase_order_product =
                draft.data.shipping_order_purchase_order_product.filter(it => {
                    const id = it?.purchase_order_product_id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case shippingOrderActionsTypes.UPDATE_SHIPPING_ORDER_PURCHASE_ORDER_PRODUCTS: {
            if (!draft.data?.shipping_order_purchase_order_product) break;
            const target = draft.data.shipping_order_purchase_order_product.find(
                it => it.purchase_order_product_id === action.payload.id
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
