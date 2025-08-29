import {
    InventoryAttributes, InventoryCreationAttributes
} from "./models/base/Inventories.model.js";
import {
    InventoryLocationItemAttributes,
    InventoryLocationItemCreationAttributes, 
} from "./models/references/inventories_locations_items.model.js";
import {
    ScrapAttributes,
    ScrapCreateAttributes   
} from "./models/references/scrap.model.js";

export type {
    InventoryAttributes,
    InventoryCreationAttributes,
    InventoryLocationItemAttributes,
    InventoryLocationItemCreationAttributes,
    ScrapAttributes,
    ScrapCreateAttributes
}