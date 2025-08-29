import validateProductDiscountMiddleware from "../middleware/product-discount-ranges/validationMiddleware.js";
import ProductDiscountRangesController from "../controllers/ProductDiscountRanges.controller.js";
import { Router } from "express";
const createProductDiscountRangesRouter = () => {
    const productDiscountRangesRouter = Router();
    productDiscountRangesRouter.get("/", ProductDiscountRangesController.getAll);
    productDiscountRangesRouter.get("/id/:id", ProductDiscountRangesController.getById);
    productDiscountRangesRouter.post("/", validateProductDiscountMiddleware, ProductDiscountRangesController.create);
    productDiscountRangesRouter.patch("/:id", validateProductDiscountMiddleware, ProductDiscountRangesController.update);
    productDiscountRangesRouter.delete("/:id", ProductDiscountRangesController.delete);
    return productDiscountRangesRouter;
};
export default createProductDiscountRangesRouter;
