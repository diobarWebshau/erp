import type {
    IPartialProductionLine
} from "./productionLines"; // Asegúrate de tener esta interfaz

interface IPurchasedOrderProductLocationProductionLine {
    id: number;
    production_line_id: number | null;
    purchase_order_product_id: number;
    production_line?: IPartialProductionLine;
    created_at: string;
    updated_at: string;
}

type IPartialPurchasedOrderProductLocationProductionLine = Partial<IPurchasedOrderProductLocationProductionLine>;

const defaultValuePurchasedOrderProductLocationProductionLine: IPurchasedOrderProductLocationProductionLine = {
    id: 0,
    production_line_id: null,
    purchase_order_product_id: 0,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialPurchasedOrderProductLocationProductionLine: IPartialPurchasedOrderProductLocationProductionLine = {
    production_line_id: null,
    purchase_order_product_id: 0,
};

export type {
    IPurchasedOrderProductLocationProductionLine,
    IPartialPurchasedOrderProductLocationProductionLine,
};

export {
    defaultValuePurchasedOrderProductLocationProductionLine,
    defaultValuePartialPurchasedOrderProductLocationProductionLine,
};
