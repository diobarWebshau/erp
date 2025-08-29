import validateProductDiscountClientsMiddleware from "../middleware/product-discounts-client/validationMiddleware.js";
import ProductDiscountsClientsController from "../controllers/ProductDiscountsClients.controller.js";
import { Router } from "express";
const createProductDiscountsClientRouter = () => {
    const productDiscountsClientRouter = Router();
    productDiscountsClientRouter.get("/", ProductDiscountsClientsController.getAll);
    productDiscountsClientRouter.get("/id/:id", ProductDiscountsClientsController.getById);
    productDiscountsClientRouter.post("/", validateProductDiscountClientsMiddleware, ProductDiscountsClientsController.create);
    productDiscountsClientRouter.patch("/:id", validateProductDiscountClientsMiddleware, ProductDiscountsClientsController.update);
    productDiscountsClientRouter.delete("/:id", ProductDiscountsClientsController.delete);
    return productDiscountsClientRouter;
};
export default createProductDiscountsClientRouter;
