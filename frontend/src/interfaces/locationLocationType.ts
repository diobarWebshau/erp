import type { ILocationType } from "./locationTypes";

interface ILocationLocationType {
    id: number;
    location_id: number;
    location_type_id: number;
    location_type: ILocationType;
}

type IPartialLocationLocationType = Partial<ILocationLocationType>;

interface LocationLocationTypeManager {
    added: IPartialLocationLocationType[],
    deleted: IPartialLocationLocationType[],
    modified: IPartialLocationLocationType[]
}

export type {
    ILocationLocationType,
    IPartialLocationLocationType,
    LocationLocationTypeManager
};

