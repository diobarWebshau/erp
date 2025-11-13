import type { IPartialLocation } from "../../../../interfaces/locations";
import type { LocationAction } from "./locationTypes";
import { locationActonsType } from "./locationTypes";

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


// draft 

const set_draft_location = (payload: IPartialLocation): LocationAction => ({
    type: locationActonsType.SET_DRAFT_LOCATION,
    payload
});

const update_draft_location = (payload: IPartialLocation): LocationAction => ({
    type: locationActonsType.UPDATE_DRAFT_LOCATION,
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
    set_step,
    back_step,
    next_step,
    clear
}



