import {
    OperationAttributes, OperationCreateAttributes,
    TableAttributes, TableCreateAttributes,
    LogAttributes, LogCreateAttributes
} from "./logs/types.js";

import {
    PermissionAttributes,
    PermissionCreationAttributes,
    RoleAttributes,
    RoleCreationAttributes,
    RolePermissionAttributes,
    RolePermissionCreationAttributes,
    UserAttributes,
    UserCreationAttributes
} from "./authentication/types.js"

import {
    InventoryAttributes,
    InventoryCreationAttributes,
    InventoryLocationItemAttributes,
    InventoryLocationItemCreationAttributes,
    ScrapAttributes,
    ScrapCreateAttributes
} from "./inventories/types.js";

import {
    InventoryTransferAttributes,
    InventoryTransferCreationAttributes
} from "./inventories_transfers/types.js";

import {
    CarrierAttributes,
    CarrierCreateAttributes,
    ShippingOrderAttributes,
    ShippingOrderCreationAttributes,
} from "./logistics/types.js";

import {
    PurchaseOrderProductAttributes,
    PurchaseOrderProductCreateAttributes,
    AppliedProductDiscountClientAttributes,
    AppliedProductDiscountClientCreateAttributes,
    AppliedProductDiscountRangeAttributes,
    AppliedProductDiscountRangeCreateAttributes,
    ProductDiscountClientAttributes,
    ProductDiscountClientCreateAttributes,
    PurchasedOrderAttributes,
    PurchasedOrderCreateAttributes,
} from "./sales/types.js"

export type {
    PermissionAttributes,
    PermissionCreationAttributes,
    RoleAttributes,
    RoleCreationAttributes,
    RolePermissionAttributes,
    RolePermissionCreationAttributes,
    UserAttributes,
    UserCreationAttributes,
    CarrierAttributes,
    CarrierCreateAttributes,
    ShippingOrderAttributes,
    ShippingOrderCreationAttributes,
    OperationAttributes, OperationCreateAttributes,
    TableAttributes, TableCreateAttributes,
    LogAttributes, LogCreateAttributes,
    InventoryAttributes,
    InventoryCreationAttributes,
    InventoryLocationItemAttributes,
    InventoryLocationItemCreationAttributes,
    InventoryTransferAttributes,
    InventoryTransferCreationAttributes,
    PurchaseOrderProductAttributes,
    PurchaseOrderProductCreateAttributes,
    AppliedProductDiscountClientAttributes,
    AppliedProductDiscountClientCreateAttributes,
    AppliedProductDiscountRangeAttributes,
    AppliedProductDiscountRangeCreateAttributes,
    ProductDiscountClientAttributes,
    ProductDiscountClientCreateAttributes,
    PurchasedOrderAttributes,
    PurchasedOrderCreateAttributes,
    ScrapAttributes,
    ScrapCreateAttributes
};
