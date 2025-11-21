import type { IInputType } from "./inputType";

interface IInput {
    id: number,
    custom_id: string,
    name: string,
    description: string,
    input_types_id: number | null,
    presentation: string,
    is_draft: boolean,
    unit_cost: number | null,
    supplier: string,
    photo: string | File,
    status: boolean,
    storage_conditions: string,
    created_at: string,
    updated_at: string,
    input_types?: IInputType,
    barcode?: number
}

type IPartialInput = Partial<IInput>;

const defaultValueInput: IInput = {
    id: 0,
    custom_id: '',
    is_draft: false,
    storage_conditions: '',
    name: '',
    description: '',
    presentation: "",
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
    presentation: "",
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
