import type {
    IProduct
} from "./product";
import type {
    IInput
} from "./inputs";
import type { IPartialProductInputProcess } from "./productInpustProcesses";

interface IProductInput {
    id: number | string,
    product_id: number,
    input_id: number,
    equivalence: number,
    product?: IProduct,
    inputs?: IInput,
    product_input_process?: IPartialProductInputProcess[]
}

type IPartialProductInput =
    Partial<IProductInput>;

interface ProductInputManager {
    added: IPartialProductInput[];
    deleted: IProductInput[];
    modified: IPartialProductInput[];
}

const defaultValueProductInput:
    IProductInput = {
    id: 0,
    product_id: 0,
    input_id: 0,
    equivalence: 0,
};

const defaultValuePartialProductInput:
    IPartialProductInput = {
    product_id: 0,
    input_id: 0,
    equivalence: 0,
};

export type {
    IProductInput,
    IPartialProductInput,
    ProductInputManager
};

export {
    defaultValueProductInput,
    defaultValuePartialProductInput,
};
