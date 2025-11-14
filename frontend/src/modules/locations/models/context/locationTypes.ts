import type { IPartialLocationLocationType } from "interfaces/locationLocationType";
import type { IPartialLocation } from "../../../../interfaces/locations";
import type { IPartialLocationProductionLine } from "interfaces/locationsProductionLines";

interface LocationState {
    total_steps: number,
    current_step: number,
    data: IPartialLocation,
    draft: IPartialLocation,
}

type LocationCommands = {
    refetch: () => Promise<void>;
    reset: () => void;
}


const initialLocationState: LocationState = {
    total_steps: 2,
    current_step: 0,
    data: {
        location_location_type: [],
        is_active: true,
    },
    draft: {
        location_location_type: [],
    },
}

const locationActonsType = {
    // DATA
    SET_LOCATION: "SET_LOCATION",
    UPDATE_LOCATION: "UPDATE_LOCATION",
    SET_FROM_SERVER: "SET_FROM_SERVER",
    ADD_LOCATION_LOCATION_TYPE: "ADD_LOCATION_LOCATION_TYPE",
    REMOVE_LOCATION_LOCATION_TYPE: "REMOVE_LOCATION_LOCATION_TYPE",
    ADD_LOCATION_PRODUCTION_LINE: "ADD_LOCATION_PRODUCTION_LINE",
    REMOVE_LOCATION_PRODUCTION_LINE: "REMOVE_LOCATION_PRODUCTION_LINE",
    // DRAFT
    SET_DRAFT_LOCATION: "SET_DRAFT_LOCATION",
    UPDATE_DRAFT_LOCATION: "UPDATE_DRAFT_LOCATION",
    ADD_DRAFT_LOCATION_LOCATION_TYPE: "ADD_DRAFT_LOCATION_LOCATION_TYPE",
    REMOVE_DRAFT_LOCATION_LOCATION_TYPE: "REMOVE_DRAFT_LOCATION_LOCATION_TYPE",
    ADD_DRAFT_LOCATION_PRODUCTION_LINE: "ADD_DRAFT_LOCATION_PRODUCTION_LINE",
    REMOVE_DRAFT_LOCATION_PRODUCTION_LINE: "REMOVE_DRAFT_LOCATION_PRODUCTION_LINE",
    // STEPS
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    // CLEAR
    CLEAR: "CLEAR",
} as const;

type LocationActionType = typeof locationActonsType[keyof typeof locationActonsType];

type LocationAction =
    // DATA
    | { type: typeof locationActonsType.SET_LOCATION, payload: IPartialLocation }
    | { type: typeof locationActonsType.UPDATE_LOCATION, payload: IPartialLocation }
    | { type: typeof locationActonsType.SET_FROM_SERVER, payload: IPartialLocation }
    | { type: typeof locationActonsType.ADD_LOCATION_LOCATION_TYPE, payload: IPartialLocationLocationType }
    | { type: typeof locationActonsType.REMOVE_LOCATION_LOCATION_TYPE, payload: number[] }
    | { type: typeof locationActonsType.ADD_LOCATION_PRODUCTION_LINE, payload: IPartialLocationProductionLine[] }
    | { type: typeof locationActonsType.REMOVE_LOCATION_PRODUCTION_LINE, payload: number[] }
    // DRAFT
    | { type: typeof locationActonsType.SET_DRAFT_LOCATION, payload: IPartialLocation }
    | { type: typeof locationActonsType.UPDATE_DRAFT_LOCATION, payload: IPartialLocation }
    | { type: typeof locationActonsType.ADD_DRAFT_LOCATION_LOCATION_TYPE, payload: IPartialLocationLocationType }
    | { type: typeof locationActonsType.REMOVE_DRAFT_LOCATION_LOCATION_TYPE, payload: number[] }
    | { type: typeof locationActonsType.ADD_DRAFT_LOCATION_PRODUCTION_LINE, payload: IPartialLocationProductionLine[] }
    | { type: typeof locationActonsType.REMOVE_DRAFT_LOCATION_PRODUCTION_LINE, payload: number[] }
    // STEPS
    | { type: typeof locationActonsType.SET_STEP, payload: number }
    | { type: typeof locationActonsType.BACK_STEP }
    | { type: typeof locationActonsType.NEXT_STEP }
    // CLEAR
    | { type: typeof locationActonsType.CLEAR };


export type {
    LocationState,
    LocationAction,
    LocationActionType,
    LocationCommands,
};

export {
    locationActonsType,
    initialLocationState,
};



