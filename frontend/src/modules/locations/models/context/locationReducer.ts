import { produce, type Draft } from "immer";
import type { LocationState, LocationAction } from "./locationTypes";
import { locationActonsType } from "./locationTypes";

const locationReducer = produce((draft: Draft<LocationState>, action: LocationAction) => {
    switch (action.type) {
        // data
        case locationActonsType.SET_LOCATION: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case locationActonsType.UPDATE_LOCATION: {
            Object.assign(draft.data, action.payload);
            break;
        }
        case locationActonsType.SET_FROM_SERVER: {
            Object.assign(draft.data, action.payload);
            break;
        }
        // draft
        case locationActonsType.SET_DRAFT_LOCATION: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        case locationActonsType.UPDATE_DRAFT_LOCATION: {
            Object.assign(draft.draft, action.payload);
            break;
        }
        // steps
        case locationActonsType.SET_STEP: {
            draft.current_step = action.payload;
            break;
        }
        case locationActonsType.BACK_STEP: {
            draft.current_step -= 1;
            break;
        }
        case locationActonsType.NEXT_STEP: {
            draft.current_step += 1;
            break;
        }
        // clear
        case locationActonsType.CLEAR: {
            draft.data = {};
            break;
        }

    }
});

export default locationReducer;