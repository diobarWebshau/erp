import type { IPartialProductionLine } from "../../../interfaces/productionLines";
import type { IPartialProductionLineProduct } from "../../../interfaces/productionLinesProducts";

interface ProductionLineState {
    total_steps: number,
    current_step: number,
    data: IPartialProductionLine,
    draft: IPartialProductionLine,
}

type ProductionLineCommands = {
    refetch: () => Promise<void>;
    reset: () => void;
};

const initialProductionLineState: ProductionLineState = {
    total_steps: 2,
    current_step: 1,
    data: { production_lines_products: [] },
    draft: { production_lines_products: [] },
}

const productionLineActionsTypes = {
    // Data
    SET_PRODUCTION_LINE: "SET_PRODUCTION_LINE",
    UPDATE_PRODUCTION_LINE: "UPDATE_PRODUCTION_LINE",
    SET_FROM_SERVER: "SET_FROM_SERVER",
    ADD_PRODUCTION_LINE_PRODUCTS: "ADD_PRODUCT_TO_PRODUCTION_LINE",
    REMOVE_PRODUCTION_LINE_PRODUCTS: "REMOVE_PRODUCT_FROM_PRODUCTION_LINE",
    UPDATE_PRODUCTION_LINE_PRODUCTS: "UPDATE_PRODUCT_IN_PRODUCTION_LINE",
    // Draft
    SET_DRAFT_PRODUCTION_LINE: "SET_DRAFT_PRODUCTION_LINE",
    UPDATE_DRAFT_PRODUCTION_LINE: "UPDATE_DRAFT_PRODUCTION_LINE",
    ADD_DRAFT_PRODUCTION_LINE_PRODUCTS: "ADD_PRODUCT_TO_DRAFT_PRODUCTION_LINE",
    REMOVE_DRAFT_PRODUCTION_LINE_PRODUCTS: "REMOVE_PRODUCT_FROM_DRAFT_PRODUCTION_LINE",
    UPDATE_DRAFT_PRODUCTION_LINE_PRODUCTS: "UPDATE_PRODUCT_IN_DRAFT_PRODUCTION_LINE",
    // Steps
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    // Clear
    CLEAR: "CLEAR",
} as const;


type ProductionLineActionType =
    typeof productionLineActionsTypes[keyof typeof productionLineActionsTypes];

type ProductionLineAction =
    // Acciones directas al objeto de shipping order
    | { type: typeof productionLineActionsTypes.SET_PRODUCTION_LINE, payload: IPartialProductionLine }
    | { type: typeof productionLineActionsTypes.UPDATE_PRODUCTION_LINE, payload: IPartialProductionLine }
    | { type: typeof productionLineActionsTypes.SET_FROM_SERVER, payload: IPartialProductionLine }
    // Acciones directas al array de shipping order purchased order products
    | { type: typeof productionLineActionsTypes.ADD_PRODUCTION_LINE_PRODUCTS, payload: IPartialProductionLineProduct[] }
    | { type: typeof productionLineActionsTypes.REMOVE_PRODUCTION_LINE_PRODUCTS, payload: (number | string)[] }
    | { type: typeof productionLineActionsTypes.UPDATE_PRODUCTION_LINE_PRODUCTS, payload: { id: number | string, attributes: IPartialProductionLineProduct } }
    // Acciones directas al array de shipping order purchased order products aux
    | { type: typeof productionLineActionsTypes.ADD_DRAFT_PRODUCTION_LINE_PRODUCTS, payload: IPartialProductionLineProduct[] }
    | { type: typeof productionLineActionsTypes.REMOVE_DRAFT_PRODUCTION_LINE_PRODUCTS, payload: (number | string)[] }
    | { type: typeof productionLineActionsTypes.UPDATE_DRAFT_PRODUCTION_LINE_PRODUCTS, payload: { id: number | string, attributes: IPartialProductionLineProduct } }
    // Acciones directas al objeto de draft shipping order
    | { type: typeof productionLineActionsTypes.SET_DRAFT_PRODUCTION_LINE, payload: IPartialProductionLine }
    | { type: typeof productionLineActionsTypes.UPDATE_DRAFT_PRODUCTION_LINE, payload: IPartialProductionLine }
    // Acciones directas al array de draft shipping order purchased order products
    | { type: typeof productionLineActionsTypes.ADD_DRAFT_PRODUCTION_LINE_PRODUCTS, payload: IPartialProductionLineProduct[] }
    | { type: typeof productionLineActionsTypes.REMOVE_DRAFT_PRODUCTION_LINE_PRODUCTS, payload: (number | string)[] }
    | { type: typeof productionLineActionsTypes.UPDATE_DRAFT_PRODUCTION_LINE_PRODUCTS, payload: { id: number | string, attributes: IPartialProductionLineProduct } }
    // Acciones de los steps
    | { type: typeof productionLineActionsTypes.SET_STEP, payload: number }
    | { type: typeof productionLineActionsTypes.BACK_STEP }
    | { type: typeof productionLineActionsTypes.NEXT_STEP }
    // Acciones de limpieza
    | { type: typeof productionLineActionsTypes.CLEAR }; 

export type {
    ProductionLineState,
    ProductionLineAction,
    ProductionLineActionType,
    ProductionLineCommands,
};

export {
    productionLineActionsTypes,
    initialProductionLineState,
};
