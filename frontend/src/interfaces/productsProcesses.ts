import type { IPartialProduct } from "./product";
import type { IPartialProcess } from "./processes";
import type { IPartialProductInputProcess } from "./productInpustProcesses";
import type { ParentWithChildDiffSingle } from "../utils/validation-on-update/ValidationOnUpdate2";

interface IProductProcess {
    id: number | string;
    product_id: number;
    process_id: number;
    sort_order: number;
    product?: IPartialProduct,
    process?: IPartialProcess;
    product_input_process?: IPartialProductInputProcess[]
    product_inputs_processes_updated?: IProductInputProcessManager,
}

type IProductInputProcessManager = {
    added: IPartialProduct[],
    modified: IPartialProductProcess[],
    deleted: IPartialProductProcess[]
}

type ProductProcessManager = ParentWithChildDiffSingle<
    IPartialProductProcess,
    IPartialProductInputProcess,
    "product_input_process_updated"
>;

type IPartialProductProcess =
    Partial<IProductProcess>;

const defaultValueProductProcess:
    IProductProcess = {
    id: 0,
    product_id: 0,
    process_id: 0,
    sort_order: 0,
};

const defaultValuePartialProductProcess:
    IPartialProductProcess = {
    product_id: 0,
    process_id: 0,
    sort_order: 0,
};

export type {
    IProductProcess,
    IPartialProductProcess,
    ProductProcessManager
};

export {
    defaultValueProductProcess,
    defaultValuePartialProductProcess,
};
