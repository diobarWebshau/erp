import createAppliedProductDiscountsClientRouter from "./routers/AppliedProductDiscountClient.router.js";
import createAppliedProductDiscountsRangesRouter from "./routers/AppliedProductDiscountsRanges.router.js";
import createProductDiscountsClientRouter from "./routers/ProductDiscountsClient.router.js";
import createPurchaseOrdersProductsRouter from "./routers/PurchasedOrderProduct.router.js";
import createPurchasedOrderRouter from "./routers/PurchasedOrder.router.js";
const Sales = {
    createAppliedProductDiscountsClientRouter,
    createAppliedProductDiscountsRangesRouter,
    createProductDiscountsClientRouter,
    createPurchaseOrdersProductsRouter,
    createPurchasedOrderRouter
};
export default Sales;
