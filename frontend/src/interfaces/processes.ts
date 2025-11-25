import type { IPartialProductInputProcess } from "./productInpustProcesses";

interface IProcess {
    id: number | string,
    name: string,
    description: string,
    created_at: string,
    updated_at: string,
    product_input_processes?: IPartialProductInputProcess[]
}

type IPartialProcess = Partial<IProcess>;

const defaultValueProcess: IProcess = {
    id: 0,
    name: '',
    description: '',
    created_at: '',
    updated_at: '',
};

const defaultValuePartialProcess: IPartialProcess = {
    name: '',
};

export type {
    IProcess,
    IPartialProcess,
};

export {
    defaultValueProcess,
    defaultValuePartialProcess,
};
