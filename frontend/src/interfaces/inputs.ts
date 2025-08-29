import type { IInputType } from "./inputType";

interface IInput {
    id: number,
    name: string,
    input_types_id: number | null,
    unit_cost: number | null,
    supplier: string,
    photo: string | File,
    status: boolean,
    created_at: string,
    updated_at: string,
    input_types?: IInputType,
}

type IPartialInput = Partial<IInput>;

const defaultValueInput: IInput = {
    id: 0,
    name: '',
    input_types_id: null,
    unit_cost: 0,
    supplier: '',
    photo: '',
    status: true,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialInput: IPartialInput = {
    name: '',
    input_types_id: null,
    unit_cost: 0,
    supplier: '',
    photo: '',
    status: true,
};

export type {
    IInput,
    IPartialInput,
};

export {
    defaultValueInput,
    defaultValuePartialInput,
};
