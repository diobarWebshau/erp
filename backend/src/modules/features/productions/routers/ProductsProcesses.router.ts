import validateProductsProcessesMiddleware 
    from "../middleware/products-processes/validationMiddleware.js";
import ProductsProcessesController 
    from "../controllers/ProductsProcesses.controller.js";
import { Router } from "express";

const createProductsProcessesRouter = (): Router => {
    const productsProcessesRouter = Router();
    productsProcessesRouter.get("/", 
        ProductsProcessesController.getAll);
    productsProcessesRouter.get("/id/:id", 
        ProductsProcessesController.getById);
    productsProcessesRouter.post("/", 
        validateProductsProcessesMiddleware, 
        ProductsProcessesController.create);
    productsProcessesRouter.patch("/:id", 
        validateProductsProcessesMiddleware, 
        ProductsProcessesController.update);
    productsProcessesRouter.delete("/:id", 
        ProductsProcessesController.deleteById);
    return productsProcessesRouter;
}

export default createProductsProcessesRouter;