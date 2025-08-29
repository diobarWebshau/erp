import validateAppliedProductDiscountClientMiddleware from "../middleware/applied-product-discounts-client/validationMiddleware.js";
import AppliedProductDiscountClientController from "../controllers/AppliedProductDiscountsClient.controller.js";
import { Router } from "express";
const createAppliedProductDiscountsClientRouter = () => {
    const appliedProductDiscountClientRouter = Router();
    appliedProductDiscountClientRouter.get("/", AppliedProductDiscountClientController.getAll);
    appliedProductDiscountClientRouter.get("/id/:id", AppliedProductDiscountClientController.getById);
    appliedProductDiscountClientRouter.post("/", validateAppliedProductDiscountClientMiddleware, AppliedProductDiscountClientController.create);
    appliedProductDiscountClientRouter.patch("/:id", validateAppliedProductDiscountClientMiddleware, AppliedProductDiscountClientController.update);
    appliedProductDiscountClientRouter.delete("/:id", AppliedProductDiscountClientController.delete);
    return appliedProductDiscountClientRouter;
};
export default createAppliedProductDiscountsClientRouter;
