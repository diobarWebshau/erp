import type { IPartialProductionLine } from "./../../../interfaces/productionLines";
import type { IPartialProductionLineProduct } from "./../../../interfaces/productionLinesProducts";
import type { ProductionLineAction } from "./productionLineTypes";
import { productionLineActionsTypes } from "./productionLineTypes";

// ? Acciones directas al objeto de production line

const set_production_line = (
    payload: IPartialProductionLine
): ProductionLineAction => ({
    type: productionLineActionsTypes.SET_PRODUCTION_LINE,
    payload
});

const update_production_line = (
    payload: IPartialProductionLine
): ProductionLineAction => ({
    type: productionLineActionsTypes.UPDATE_PRODUCTION_LINE,
    payload
});

const set_from_server = (
    payload: IPartialProductionLine
): ProductionLineAction => ({
    type: productionLineActionsTypes.SET_FROM_SERVER,
    payload
});

const add_production_line_products = (
    payload: IPartialProductionLineProduct[]
): ProductionLineAction => ({
    type: productionLineActionsTypes.ADD_PRODUCTION_LINE_PRODUCTS,
    payload
});

const remove_production_line_products = (
    payload: (number | string)[]
): ProductionLineAction => ({
    type: productionLineActionsTypes.REMOVE_PRODUCTION_LINE_PRODUCTS,
    payload
});

const update_production_line_products = (
    payload: { id: number | string; attributes: IPartialProductionLineProduct }
): ProductionLineAction => ({
    type: productionLineActionsTypes.UPDATE_PRODUCTION_LINE_PRODUCTS,
    payload
});


// ? Acciones directas al objeto de draft production line

const set_draft_production_line = (
    payload: IPartialProductionLine
): ProductionLineAction => ({
    type: productionLineActionsTypes.SET_DRAFT_PRODUCTION_LINE,
    payload
});

const update_draft_production_line = (
    payload: IPartialProductionLine
): ProductionLineAction => ({
    type: productionLineActionsTypes.UPDATE_DRAFT_PRODUCTION_LINE,
    payload
});

const add_draft_production_line_products = (
    payload: IPartialProductionLineProduct[]
): ProductionLineAction => ({
    type: productionLineActionsTypes.ADD_DRAFT_PRODUCTION_LINE_PRODUCTS,
    payload
});

const remove_draft_production_line_products = (
    payload: (number | string)[]
): ProductionLineAction => ({
    type: productionLineActionsTypes.REMOVE_DRAFT_PRODUCTION_LINE_PRODUCTS,
    payload
});

const update_draft_production_line_products = (
    payload: { id: number | string; attributes: IPartialProductionLineProduct }
): ProductionLineAction => ({
    type: productionLineActionsTypes.UPDATE_DRAFT_PRODUCTION_LINE_PRODUCTS,
    payload
});


// ? Acciones de los steps

const set_step = (
    payload: number
): ProductionLineAction => ({
    type: productionLineActionsTypes.SET_STEP,
    payload
});

const back_step = (): ProductionLineAction => ({
    type: productionLineActionsTypes.BACK_STEP
});

const next_step = (): ProductionLineAction => ({
    type: productionLineActionsTypes.NEXT_STEP
});

// ? Acciones de limpieza

const clear = (): ProductionLineAction => ({
    type: productionLineActionsTypes.CLEAR
});


export {
    set_production_line,
    update_production_line,
    set_from_server,
    add_production_line_products,
    remove_production_line_products,
    update_production_line_products,
    set_draft_production_line,
    update_draft_production_line,
    add_draft_production_line_products,
    remove_draft_production_line_products,
    update_draft_production_line_products,
    set_step,
    back_step,
    next_step,
    clear
}
