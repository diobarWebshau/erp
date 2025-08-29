import {
    logSchema,
    operationSchema,
    tableSchema
} from "./logs/schemas.js";

import {
    inventarySchema,
    locationInventoryItemSchema,
    scrapSchema
} from "./inventories/schemas.js"

import {
    inventoryTransferSchema
} from "./inventories_transfers/schemas.js"

import {
    carrierSchema,
    logisticSchema
} from "./logistics/schemas.js"

import {
    permissionSchema,
    roleSchema,
    rolePermissionSchema,
    userSchema
} from "./authentication/schemas.js";

import {
    appliedProductDiscountClientSchema,
    appliedProductDiscountRangeSchema,
    productDiscountClientSchema,
    PurchasedOrderSchema,
    purchaseOrderProductSchema
} from "./sales/schemas.js";

export {
    logSchema,
    operationSchema,
    tableSchema,
    appliedProductDiscountClientSchema,
    appliedProductDiscountRangeSchema,
    productDiscountClientSchema,
    PurchasedOrderSchema,
    purchaseOrderProductSchema,
    carrierSchema,
    logisticSchema,
    inventoryTransferSchema,
    inventarySchema,
    locationInventoryItemSchema,
    scrapSchema,
    permissionSchema,
    roleSchema,
    rolePermissionSchema,
    userSchema
}