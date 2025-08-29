import PurchasedOrdersProductsLocationsProductionLinesController from "../controllers/PurchasedOrdersProductsLocationsProductionLines.controller.js";
import validatePurchasedOrdersProductsLocationsProductionLinesMiddleware from "../middleware/purchased_orders_locations_production_lines/validationMiddleware.js";
import { Router } from "express";
const createPurchasedOrdersProductsLocationsProductionLineRouter = () => {
    const purchasedOrdersProductsLocationsProductionLinesRouter = Router();
    purchasedOrdersProductsLocationsProductionLinesRouter.get("/", PurchasedOrdersProductsLocationsProductionLinesController.getAll);
    purchasedOrdersProductsLocationsProductionLinesRouter.get("/id/:id", PurchasedOrdersProductsLocationsProductionLinesController.getById);
    purchasedOrdersProductsLocationsProductionLinesRouter.post("/", validatePurchasedOrdersProductsLocationsProductionLinesMiddleware, PurchasedOrdersProductsLocationsProductionLinesController.create);
    purchasedOrdersProductsLocationsProductionLinesRouter.patch("/:id", validatePurchasedOrdersProductsLocationsProductionLinesMiddleware, PurchasedOrdersProductsLocationsProductionLinesController.update);
    purchasedOrdersProductsLocationsProductionLinesRouter.delete("/:id", PurchasedOrdersProductsLocationsProductionLinesController.deleteById);
    return purchasedOrdersProductsLocationsProductionLinesRouter;
};
export default createPurchasedOrdersProductsLocationsProductionLineRouter;
