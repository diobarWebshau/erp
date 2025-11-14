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
        case locationActonsType.ADD_LOCATION_LOCATION_TYPE: {
            draft.data.location_location_type?.push(action.payload);
            break;
        }
        case locationActonsType.REMOVE_LOCATION_LOCATION_TYPE: {
            if (!draft.data.location_location_type) return;
            const idsToRemove = new Set<string | number>(action.payload);
            draft.data.location_location_type = draft.data.location_location_type.filter(it => {
                const id = it?.location_type_id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        case locationActonsType.ADD_LOCATION_PRODUCTION_LINE: {
            draft.data.location_production_line?.push(...action.payload);
            break;
        }
        case locationActonsType.REMOVE_LOCATION_PRODUCTION_LINE: {
            if (!draft.data.location_production_line) return;
            const idsToRemove = new Set<string | number>(action.payload);
            draft.data.location_production_line = draft.data.location_production_line.filter(it => {
                const id = it?.production_line_id;
                return id == null ? true : !idsToRemove.has(id);
            });
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
        case locationActonsType.ADD_DRAFT_LOCATION_LOCATION_TYPE: {
            draft.draft.location_location_type?.push(action.payload);
            break;
        }
        case locationActonsType.REMOVE_DRAFT_LOCATION_LOCATION_TYPE: {
            if (!draft.draft.location_location_type) return;
            const idsToRemove = new Set<string | number>(action.payload);
            draft.draft.location_location_type = draft.draft.location_location_type.filter(it => {
                const id = it?.location_type_id;
                return id == null ? true : !idsToRemove.has(id);
            });
            break;
        }
        case locationActonsType.ADD_DRAFT_LOCATION_PRODUCTION_LINE: {
            draft.draft.location_production_line?.push(...action.payload);
            break;
        }
        case locationActonsType.REMOVE_DRAFT_LOCATION_PRODUCTION_LINE: {
            if (!draft.draft.location_production_line) return;
            const idsToRemove = new Set<string | number>(action.payload);
            draft.draft.location_production_line = draft.draft.location_production_line.filter(it => {
                const id = it?.production_line_id;
                return id == null ? true : !idsToRemove.has(id);
            });
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