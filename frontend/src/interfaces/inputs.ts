import type { IInputType } from "./inputType";

interface IInput {
    id: number,
    custom_id: string,
    name: string,
    description: string,
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
    custom_id: '',
    name: '',
    description: '',
    input_types_id: null,
    unit_cost: 0,
    supplier: '',
    photo: '',
    status: true,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialInput: IPartialInput = {
    custom_id: '',
    name: '',
    description: '',
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
