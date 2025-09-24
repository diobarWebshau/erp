import type { ILocation } from "./locations";

interface IInventory {
    id: number;
    stock: number;
    minimum_stock: number;
    maximum_stock: number;
    lead_time: number;
    created_at: string;
    updated_at: string;
}

interface IItem {
    id: string,
    item_id: number,
    item_name: string,
    item_type: "product" | "input",
    sku: string | null,
    locations: ILocation[]
}

interface IInventoryDetails {
    id?: number,
    stock: number,
    item_id: number,
    available: number,
    commited: number,
    item_name: string,
    item_type: "product" | "input",
    location_id: number,
    inventory_id: number,
    minimum_stock: number,
    maximum_stock: number,
    lead_time: number,
    location_name: string,
    item?: IItem,
    qty?: number,
    location?: ILocation | null
}



type IPartialInventoryDetails = Partial<IInventoryDetails>;

type IPartialInventory = Partial<IInventory>;

const defaultValueInventoryDetails: IInventoryDetails = {
    stock: 0,
    item_id: 0,
    available: 0,
    commited: 0,
    item_name: "",
    item_type: "product",
    location_id: 0,
    inventory_id: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    lead_time: 0,
    location_name: "",
};

const defaultValueInventory: IInventory = {
    id: 0,
    stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    lead_time: 0,
    created_at: '',
    updated_at: '',
};

const defaultValuePartialInventory: IPartialInventory = {
    stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    lead_time: 0,
};

export type {
    IInventory,
    IPartialInventory,
    IInventoryDetails,
    IPartialInventoryDetails,
    IItem
};

export {
    defaultValueInventory,
    defaultValuePartialInventory,
    defaultValueInventoryDetails
};
