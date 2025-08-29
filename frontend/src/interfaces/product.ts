import type {
    IPartialProductDiscountRange
} from "./product-discounts-ranges"
import type {
    IPartialProductInput
} from "./productsInputs";
import type {
    IPartialProductProcess
} from "./productsProcesses";
import type {
    ProductInputManager
} from "./productsInputs";
import type {
    ProductProcessManager
} from "./productsProcesses";
import type {
    ProductDiscountRangeManager
} from "./product-discounts-ranges";

interface ProductLocationAvailability {
    location_id: number;      // id de la ubicación
    location_name: string;    // nombre de la ubicación
    stock: number;            // stock
    maximum_stock: number;    // stock máximo
    minimum_stock: number;    // stock mínimo
    available: number;        // cantidad disponible
    product_id: number;       // id del producto
    product_name: string;     // nombre del producto
}

interface IProduct {
    id: number,
    name: string,
    type: string,
    description: string,
    sku: string,
    active: boolean,
    sale_price: number,
    photo: string | File,
    created_at: string,
    updated_at: string,
    product_processes?: IPartialProductProcess[],
    product_discount_ranges?: IPartialProductDiscountRange[],
    products_inputs?: IPartialProductInput[]
    product_discount_ranges_updated?: ProductDiscountRangeManager,
    products_inputs_updated?: ProductInputManager,
    product_processes_updated?: ProductProcessManager,
    summary_location?: ProductLocationAvailability
}

type IPartialProduct = Partial<IProduct>;


const defaultValueProduct: IProduct = {
    id: 0,
    name: '',
    type: '',
    description: '',
    sku: '',
    active: true,
    sale_price: 0,
    photo: '',
    created_at: '',
    updated_at: '',
};

const defaultValuePartialProduct: IPartialProduct = {
    name: '',
    type: '',
    description: '',
    sku: '',
    active: true,
    sale_price: 0,
    photo: '',
};


export type {
    IProduct,
    IPartialProduct,
    ProductLocationAvailability
};

export {
    defaultValueProduct,
    defaultValuePartialProduct,
};
