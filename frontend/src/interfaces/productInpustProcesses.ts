import type { IPartialProductInput } from "./productsInputs";
import type { IPartialProductProcess } from "./productsProcesses";

interface IProductInputProcess {
    id: number | string;
    product_id: number,
    product_input_id: number,
    product_process_id: number,
    product_input?: IPartialProductInput,
    product_process?: IPartialProductProcess,
    qty: number,
}

interface IProductInputProcessManager {
    added: IPartialProductInputProcess[];
    deleted: IProductInputProcess[];
    modified: IPartialProductInputProcess[];
}

type IPartialProductInputProcess = Partial<IProductInputProcess>;

export type {
    IProductInputProcess,
    IPartialProductInputProcess,
    IProductInputProcessManager
}