interface IProduction {
    id: number;
    production_order_id: number;
    product_id: number | null;
    product_name: string | null;
    process_id: number | null;
    qty: number;
    scrap: number;
    created_at: string;
    updated_at: string;
}

type IPartialProduction = Partial<IProduction>;

const defaultValueProduction: IProduction = {
    id: 0,
    process_id: null,
    production_order_id: 0,
    product_id: null,
    product_name: null,
    qty: 0,
    scrap: 0,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialProduction: IPartialProduction = {
    process_id: null,
    production_order_id: 0,
    product_id: null,
    product_name: null,
    qty: 0,
    scrap: 0,
};

export type {
    IProduction,
    IPartialProduction,
};

export {
    defaultValueProduction,
    defaultValuePartialProduction,
};
