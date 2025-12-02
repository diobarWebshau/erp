import type { IPartialInventory } from "./inventories";
import type { IPartialLocation } from "./locations";
import type { IPartialItem } from "./item";

interface IInventoryLocationItem {
    id: number | string,
    inventory_id: number,
    location_id: number,
    item_type: "product" | "input",
    item_id: number,
    item: IPartialItem,
    location: IPartialLocation,
    inventory: IPartialInventory
}

type IPartialInventoryLocationItem = Partial<IInventoryLocationItem>;

interface IInventoryLocationItemManager {
    added: IPartialInventoryLocationItem[],
    modified: IPartialInventoryLocationItem[],
    deleted: IPartialInventoryLocationItem[]
}

export type {
    IInventoryLocationItem,
    IPartialInventoryLocationItem,
    IInventoryLocationItemManager
}