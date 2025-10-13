
interface IScrap {
    id: number;
    reference_type: "Production" | "Inventory" | "Shipping";
    reference_id: number | null;
    location_id?: number | null;
    location_name?: string | null;
    item_id: number;
    item_type: "input" | "product";
    item_name: string;
    qty: number;
    reason: string;
    user_id?: number | null;
    user_name?: string | null;
    created_at?: Date;
    
}

type IPartialScrap = Partial<IScrap>;

export type {
    IScrap,
    IPartialScrap
};