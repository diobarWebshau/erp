interface ILocationType {
    id: number,
    name: string,
    created_at: string,
    updated_at: string
}

type IPartialLocationType =
    Partial<ILocationType>;

type ILocationTypeGeneric =
    IPartialLocationType
    | ILocationType
    | ILocationType[];

const defaultValueLocationType = {
    id: 0,
    name: "",
    created_at: "",
    updated_at: ""
}

const defaultValuePartialLocationType = {
    name: ""
}

export type {
    ILocationType,
    IPartialLocationType,
    ILocationTypeGeneric
};

export {
    defaultValueLocationType,
    defaultValuePartialLocationType
}