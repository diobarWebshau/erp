import type { IProduct }
    from "./product";
import type { IProcess }
    from "./processes";

interface IProductProcess {
    id: number;
    product_id: number;
    process_id: number;
    sort_order: number;
    product?: IProduct,
    process?: IProcess;
}

type IPartialProductProcess =
    Partial<IProductProcess>;

interface ProductProcessManager {
    added: IPartialProductProcess[];
    deleted: IProductProcess[];
    modified: IPartialProductProcess[];
}

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
