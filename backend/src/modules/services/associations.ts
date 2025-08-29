import {
    UserModel, PermissionModel,
    RoleModel, RolePermissionModel
} from "./authentication/associations.js";
import {
    InventoryModel,
    InventoryLocationItemModel,
    ScrapModel
} from "./inventories/associations.js";
import {
    InventoryTransferModel
} from "./inventories_transfers/associations.js";

import { CarrierModel, ShippingOrderModel }
    from "./logistics/associations.js";

import {
    LogModel, OperationModel, TableModel
} from "./logs/associations.js";

import {
    PurchaseOrderProductModel,
    AppliedProductDiscountClientModel,
    AppliedProductDiscountRangeModel, 
    ProductDiscountClientModel,
    PurchasedOrderModel
} from "./sales/associations.js";

export {
    UserModel, PermissionModel,
    RoleModel, RolePermissionModel,
    InventoryLocationItemModel,
    InventoryModel,
    ScrapModel,
    InventoryTransferModel,
    CarrierModel, ShippingOrderModel,
    LogModel, OperationModel, TableModel,
    PurchaseOrderProductModel,
    AppliedProductDiscountClientModel,
    AppliedProductDiscountRangeModel, 
    ProductDiscountClientModel,
    PurchasedOrderModel,
    
};