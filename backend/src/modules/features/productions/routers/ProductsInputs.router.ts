import validateProductInputsMiddleware 
    from "../middleware/product-input/validationMiddleware.js";
import ProductsInputsController 
    from "../controllers/ProductsInputs.controller.js";
import { Router } from "express";

const createProductsInputsRouter = (): Router => {
    const productsInputsRouter = Router();
    productsInputsRouter.get("/", 
        ProductsInputsController.getAll);
    productsInputsRouter.get("/id/:id", 
        ProductsInputsController.getById);
    productsInputsRouter.post("/", 
        validateProductInputsMiddleware, 
        ProductsInputsController.create);
    productsInputsRouter.patch("/:id", 
        validateProductInputsMiddleware, 
        ProductsInputsController.update);
    productsInputsRouter.delete("/:id", 
        ProductsInputsController.deleteById);
    return productsInputsRouter;
}

export default createProductsInputsRouter;