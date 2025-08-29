interface IInputType {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

type IPartialInputType =
    Partial<IInputType>;

const defaultValueInputType:
    IInputType = {
    id: 0,
    name: '',
    created_at: '',
    updated_at: '',
};

const defaultValuePartialInputType:
    IPartialInputType = {
    name: '',
};

export type {
    IInputType,
    IPartialInputType,
};

export {
    defaultValueInputType,
    defaultValuePartialInputType,
};
