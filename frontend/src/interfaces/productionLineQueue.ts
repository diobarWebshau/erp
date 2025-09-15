// 📌 types/production-line-queue.ts

import type { IProductionLine } from "./productionLines";
import type { IProductionOrder } from "./productionOrder";

interface IProductionLineQueue {
    id: number;
    production_line_id: number;
    production_order_id: number;
    position: number | null;
    created_at: string;
    production_line?: IProductionLine;
    production_order?: IProductionOrder;
}

type IPartialProductionLineQueue = Partial<IProductionLineQueue>;

export type {
    IProductionLineQueue,
    IPartialProductionLineQueue
};
