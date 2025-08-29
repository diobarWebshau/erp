import validateAppliedProductDiscountsRangesMiddleware from "../middleware/applied-product-discounts-ranges/validationMiddleware.js";
import AppliedProductDiscountsRangesController from "../controllers/AppliedProductDiscountsRanges.controller.js";
import { Router } from "express";
const createAppliedProductDiscountsRangesRouter = () => {
    const appliedProductDiscountClientRouter = Router();
    appliedProductDiscountClientRouter.get("/", AppliedProductDiscountsRangesController.getAll);
    appliedProductDiscountClientRouter.get("/id/:id", AppliedProductDiscountsRangesController.getById);
    appliedProductDiscountClientRouter.post("/", validateAppliedProductDiscountsRangesMiddleware, AppliedProductDiscountsRangesController.create);
    appliedProductDiscountClientRouter.patch("/:id", validateAppliedProductDiscountsRangesMiddleware, AppliedProductDiscountsRangesController.update);
    appliedProductDiscountClientRouter.delete("/:id", AppliedProductDiscountsRangesController.delete);
    return appliedProductDiscountClientRouter;
};
export default createAppliedProductDiscountsRangesRouter;
