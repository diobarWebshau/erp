import type {
    IPartialInventoryDetails
} from "../../../../../interfaces/inventories";

type InventoriesState = {
    total_steps: number,
    current_step: number,
    data: IPartialInventoryDetails[],
}

const inventoriesActionsTypes = {
    SET_INVENTORIES: "SET_INVENTORIES",
    ADD_ITEMS: "ADD_ITEMS",
    REMOVE_ITEMS: "REMOVE_ITEMS",
    UPDATE_ITEM: "UPDATE_ITEM",
    REMOVE_ATTRIBUTES_ITEM: "REMOVE_ATTRIBUTES_ITEM",
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    CLEAR: "CLEAR",
} as const;

type InventoriesActionType =
    typeof inventoriesActionsTypes[
    keyof typeof inventoriesActionsTypes
    ];

type InventoriesAction =
    // Acciones directas al array de inventarios
    | { type: typeof inventoriesActionsTypes.SET_INVENTORIES, payload: IPartialInventoryDetails[] }
    | { type: typeof inventoriesActionsTypes.ADD_ITEMS, payload: IPartialInventoryDetails[] }
    | { type: typeof inventoriesActionsTypes.REMOVE_ITEMS, payload: string[] }

    // Acciones directas a un item del array de inventarios
    | { type: typeof inventoriesActionsTypes.UPDATE_ITEM, payload: { id: string, attributes: IPartialInventoryDetails } }
    | { type: typeof inventoriesActionsTypes.REMOVE_ATTRIBUTES_ITEM, payload: { id: string, attributes: string[] } }

    // Acciones de los steps
    | { type: typeof inventoriesActionsTypes.SET_STEP, payload: number }
    | { type: typeof inventoriesActionsTypes.BACK_STEP }
    | { type: typeof inventoriesActionsTypes.NEXT_STEP }

    // Acciones de limpieza
    | { type: typeof inventoriesActionsTypes.CLEAR }

export type {
    InventoriesState,
    InventoriesActionType,
    InventoriesAction
};

export {
    inventoriesActionsTypes,
};
