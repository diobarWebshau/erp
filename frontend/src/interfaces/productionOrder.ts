interface IProductionOrder {
    id: number;
    order_type: 'internal' | 'client';
    order_id: number | null;
    product_id: number | null;
    product_name: string;
    qty: number;
    status: string;
    created_at: string;
    updated_at: string;
}

type IPartialProductionOrder = Partial<IProductionOrder>;

const defaultValueProductionOrder: IProductionOrder = {
    id: 0,
    order_type: 'internal',
    order_id: null,
    product_id: null,
    product_name: '',
    qty: 0,
    status: '',
    created_at: '',
    updated_at: '',
};

const defaultValuePartialProductionOrder: IPartialProductionOrder = {
    order_type: 'internal',
    order_id: null,
    product_id: null,
    product_name: '',
    qty: 0,
    status: '',
};

export type {
    IProductionOrder,
    IPartialProductionOrder,
};

export {
    defaultValueProductionOrder,
    defaultValuePartialProductionOrder,
};

