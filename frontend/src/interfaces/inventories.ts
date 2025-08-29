interface IInventory {
    id: number;
    stock: number;
    minimum_stock: number;
    maximum_stock: number;
    lead_time: number;
    created_at: string;
    updated_at: string;
}

interface IInventoryDetails {
    stock: number,
    item_id: number,
    available: number,
    commited: number,
    item_name: string,
    item_type: "product" | "input",
    location_id: number,
    inventory_id: number,
    location_name: string,
}

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
    IInventoryDetails
};

export {
    defaultValueInventory,
    defaultValuePartialInventory,
    defaultValueInventoryDetails
};
