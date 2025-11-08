import { produce, type Draft, current } from "immer";
import { clientActionsTypes } from "./clientTypes";
import type { ClientAction, ClientState } from "./clientTypes";

const clientReducer = produce((
    draft: Draft<ClientState>,
    action: ClientAction
) => {

    switch (action.type) {
        // * DATA
        case clientActionsTypes.SET_CLIENT: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case clientActionsTypes.UPDATE_CLIENT: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case clientActionsTypes.SET_FROM_SERVER: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case clientActionsTypes.ADD_CLIENT_ADDRESSES: {
            for (const item of action.payload) {
                if (draft.data?.addresses?.length === 0) {
                    const isDuplicate = draft.data?.addresses?.some(
                        it => String(it.id) === String(item.id)
                    );
                    if (isDuplicate) return;
                }
                draft.data.addresses?.push(item);
            }
            break;
        }
        case clientActionsTypes.REMOVE_CLIENT_ADDRESSES: {
            if (!draft.data?.addresses) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.data.addresses =
                draft.data.addresses.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case clientActionsTypes.UPDATE_CLIENT_ADDRESSES: {
            if (!draft.data?.addresses) break;
            const target = draft.data.addresses.find(
                it => String(it.id) === String(action.payload.id)
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        case clientActionsTypes.ADD_CLIENT_PRODUCT_DISCOUNTS: {
            for (const item of action.payload) {
                if (draft.data?.product_discounts_client?.length === 0) {
                    const isDuplicate = draft.data?.product_discounts_client?.some(
                        it => String(it.id) === String(item.id)
                    );
                    if (isDuplicate) return;
                }
                draft.data.product_discounts_client?.push(item);
            }
            break;
        }
        case clientActionsTypes.REMOVE_CLIENT_PRODUCT_DISCOUNTS: {
            if (!draft.data?.product_discounts_client) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.data.product_discounts_client =
                draft.data.product_discounts_client.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case clientActionsTypes.UPDATE_CLIENT_PRODUCT_DISCOUNTS: {
            if (!draft.data?.product_discounts_client) break;
            const target = draft.data.product_discounts_client.find(
                it => String(it.id) === String(action.payload.id)
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        // * DRAFT
        case clientActionsTypes.SET_DRAFT_CLIENT: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        case clientActionsTypes.UPDATE_DRAFT_CLIENT: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        case clientActionsTypes.ADD_DRAFT_CLIENT_ADDRESSES: {
            for (const item of action.payload) {
                if (draft.draft?.addresses?.length === 0) {
                    const isDuplicate = draft.draft?.addresses?.some(
                        it => String(it.id) === String(item.id)
                    );
                    if (isDuplicate) return;
                }
                draft.draft.addresses?.push(item);
            }
            break;
        }
        case clientActionsTypes.REMOVE_DRAFT_CLIENT_PRODUCT_DISCOUNTS: {
            if (!draft.draft?.product_discounts_client) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.draft.product_discounts_client =
                draft.draft.product_discounts_client.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case clientActionsTypes.UPDATE_DRAFT_CLIENT_PRODUCT_DISCOUNTS: {
            console.log(`entro`);
            if (!draft.draft?.product_discounts_client) break;
            const target = draft.draft.product_discounts_client.find(
                it => String(it.id) === String(action.payload.id)
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        case clientActionsTypes.ADD_DRAFT_CLIENT_PRODUCT_DISCOUNTS: {
            for (const item of action.payload) {
                if (draft.draft?.product_discounts_client?.length === 0) {
                    const isDuplicate = draft.draft?.product_discounts_client?.some(
                        it => String(it.id) === String(item.id)
                    );
                    if (isDuplicate) return;
                }
                draft.draft.product_discounts_client?.push(item);
            }
            break;
        }
        case clientActionsTypes.REMOVE_DRAFT_CLIENT_ADDRESSES: {
            if (!draft.draft?.addresses) return;
            const idsToRemove = new Set<string | number>(action.payload); // Convertir payload a Set para mejor rendimiento y no se repitan los ids
            draft.draft.addresses =
                draft.draft.addresses.filter(it => {
                    const id = it?.id;
                    // Conserva los que no tienen id; elimina solo si el id está en payload
                    return id == null ? true : !idsToRemove.has(id);
                });
            break;
        }
        case clientActionsTypes.UPDATE_DRAFT_CLIENT_ADDRESSES: {
            if (!draft.draft?.addresses) break;
            const target = draft.draft.addresses.find(
                it => String(it.id) === String(action.payload.id)
            );
            if (target) {
                Object.assign(target, action.payload.attributes);
            }
            break;
        }
        // * STEPS
        case clientActionsTypes.SET_STEP: {
            draft.current_step = action.payload;
            break;
        }
        case clientActionsTypes.BACK_STEP: {
            draft.current_step -= 1;
            break;
        }
        case clientActionsTypes.NEXT_STEP: {
            draft.current_step += 1;
            break;
        }
        // * CLEAR
        case clientActionsTypes.CLEAR: {
            draft.data = {};
            break;
        }
    }
});

export default clientReducer;