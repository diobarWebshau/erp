
import type { IPartialLocationProductionLine } from "./locationsProductionLines";
import type { IPartialProductionLineQueue } from "./productionLineQueue";
import type { IPartialProductionLineProduct, IProductionLineProductManager } from "./productionLinesProducts";
import type { IPartialProductionOrder } from "./productionOrder";

interface IProductionLine {
    id: number,
    custom_id: string,
    name: string,
    is_active: boolean,
    created_at: string,
    updated_at: string,
    location_production_line?: IPartialLocationProductionLine,
    production_lines_products?: IPartialProductionLineProduct[],
    production_lines_products_updated?: IProductionLineProductManager,
    production_order?: IPartialProductionOrder[],
    production_line_queue?: IPartialProductionLineQueue[],
}

type IPartialProductionLine =
    Partial<IProductionLine>;

const defaultValueProductionLine:
    IProductionLine = {
    id: 0,
    custom_id: "",
    name: "",
    is_active: true,
    created_at: "",
    updated_at: "",
};

const defaultValuePartialProductionLine:
    Partial<IProductionLine> = {
    custom_id: "",
    name: "",
    is_active: true,
};

export type {
    IProductionLine,
    IPartialProductionLine,
};

export {
    defaultValueProductionLine,
    defaultValuePartialProductionLine,
};
