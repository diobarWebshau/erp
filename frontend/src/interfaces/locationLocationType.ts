interface ILocationLocationType {
    id: number;
    location_id: number;
    location_type_id: number;
}

type IPartialLocationLocationType =
    Partial<ILocationLocationType>;

const defaultValueLocationLocationType:
    ILocationLocationType = {
    id: 0,
    location_id: 0,
    location_type_id: 0,
};

const defaultValuePartialLocationLocationType:
    IPartialLocationLocationType = {
    location_id: 0,
    location_type_id: 0,
};

export type {
    ILocationLocationType,
    IPartialLocationLocationType,
};

export {
    defaultValueLocationLocationType,
    defaultValuePartialLocationLocationType,
};
