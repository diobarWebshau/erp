import {
    PurchaseOrderProductAttributes,
    PurchaseOrderProductCreateAttributes
} from "./models/junctions/purchased-orders-products.model.js";
import {
    AppliedProductDiscountClientAttributes,
    AppliedProductDiscountClientCreateAttributes
} from "./models/references/AppliedProductDiscountsClient.model.js";
import {
    AppliedProductDiscountRangeAttributes,
    AppliedProductDiscountRangeCreateAttributes
} from "./models/references/AppliedProductDiscountsRanges.model.js";
import {
    ProductDiscountClientAttributes,
    ProductDiscountClientCreateAttributes,
    ProductDiscountClientManager
} from "./models/references/ProductDiscountsClients.model.js";
import {
    PurchasedOrderAttributes,
    PurchasedOrderCreateAttributes
} from "./models/references/PurchasedOrders.model.js";


export type {
    PurchaseOrderProductAttributes,
    PurchaseOrderProductCreateAttributes,
    AppliedProductDiscountClientAttributes,
    AppliedProductDiscountClientCreateAttributes,
    AppliedProductDiscountRangeAttributes,
    AppliedProductDiscountRangeCreateAttributes,
    ProductDiscountClientAttributes,
    ProductDiscountClientCreateAttributes,
    ProductDiscountClientManager,
    PurchasedOrderAttributes,
    PurchasedOrderCreateAttributes,
}