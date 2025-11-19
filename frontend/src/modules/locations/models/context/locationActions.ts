import type { IPartialLocationLocationType } from "interfaces/locationLocationType";
import type { IPartialLocation } from "../../../../interfaces/locations";
import type { LocationAction } from "./locationTypes";
import { locationActonsType } from "./locationTypes";
import type { IPartialLocationProductionLine } from "interfaces/locationsProductionLines";

// data

const set_location = (payload: IPartialLocation): LocationAction => ({
    type: locationActonsType.SET_LOCATION,
    payload
});

const update_location = (payload: IPartialLocation): LocationAction => ({
    type: locationActonsType.UPDATE_LOCATION,
    payload
});

const set_from_server = (payload: IPartialLocation): LocationAction => ({
    type: locationActonsType.SET_FROM_SERVER,
    payload
});


const add_location_location_type = (payload: IPartialLocationLocationType): LocationAction => ({
    type: locationActonsType.ADD_LOCATION_LOCATION_TYPE,
    payload
});

const remove_location_location_type = (payload: number[]): LocationAction => ({
    type: locationActonsType.REMOVE_LOCATION_LOCATION_TYPE,
    payload
});

const add_location_production_line = (payload: IPartialLocationProductionLine[]): LocationAction => ({
    type: locationActonsType.ADD_LOCATION_PRODUCTION_LINE,
    payload
});

const remove_location_production_line = (payload: number[]): LocationAction => ({
    type: locationActonsType.REMOVE_LOCATION_PRODUCTION_LINE,
    payload
});


// draft 

const set_draft_location = (payload: IPartialLocation): LocationAction => ({
    type: locationActonsType.SET_DRAFT_LOCATION,
    payload
});

const update_draft_location = (payload: IPartialLocation): LocationAction => ({
    type: locationActonsType.UPDATE_DRAFT_LOCATION,
    payload
});

const add_draft_location_location_type = (payload: IPartialLocationLocationType): LocationAction => ({
    type: locationActonsType.ADD_DRAFT_LOCATION_LOCATION_TYPE,
    payload
});

const remove_draft_location_location_type = (payload: number[]): LocationAction => ({
    type: locationActonsType.REMOVE_DRAFT_LOCATION_LOCATION_TYPE,
    payload
});

const add_draft_location_production_line = (payload: IPartialLocationProductionLine[]): LocationAction => ({
    type: locationActonsType.ADD_DRAFT_LOCATION_PRODUCTION_LINE,
    payload
});

const remove_draft_location_production_line = (payload: number[]): LocationAction => ({
    type: locationActonsType.REMOVE_DRAFT_LOCATION_PRODUCTION_LINE,
    payload
});

// steps

const set_step = (payload: number): LocationAction => ({
    type: locationActonsType.SET_STEP,
    payload
});

const back_step = (): LocationAction => ({
    type: locationActonsType.BACK_STEP
});

const next_step = (): LocationAction => ({
    type: locationActonsType.NEXT_STEP
});

// clear

const clear = (): LocationAction => ({
    type: locationActonsType.CLEAR
});


export {
    set_location,
    update_location,
    set_from_server,
    set_draft_location,
    update_draft_location,
    add_location_location_type,
    remove_location_location_type,
    add_draft_location_location_type,
    remove_draft_location_location_type,
    add_location_production_line,
    remove_location_production_line,
    add_draft_location_production_line,
    remove_draft_location_production_line,
    set_step,
    back_step,
    next_step,
    clear
}



