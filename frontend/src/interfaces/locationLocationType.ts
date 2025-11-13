import type { ILocationType } from "./locationTypes";

interface ILocationLocationType {
    id: number;
    location_id: number;
    location_type_id: number;
    location_type: ILocationType;
}

type IPartialLocationLocationType =
    Partial<ILocationLocationType>;

export type {
    ILocationLocationType,
    IPartialLocationLocationType,
};

