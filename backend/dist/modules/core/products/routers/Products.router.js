import uploadImageMiddleware from "../../../../middlewares/multer/multerMiddleware.js";
import validateProductMiddleware from "../middleware/products/validationMiddleware.js";
import ProductController from "../controllers/Products.controller.js";
import { Router } from "express";
const createProductsRouter = () => {
    const productRouter = Router();
    productRouter.get("/", ProductController.getAll);
    productRouter.get("/id/:id", ProductController.getById);
    productRouter.get("/filter/:filter", ProductController.getByLike);
    productRouter.post("/filter-exclude/:filter", ProductController.getByLikeExcludeIds);
    productRouter.get("/exclude", ProductController.getProductsByExcludeIds);
    productRouter.get("/name/:name", ProductController.getByName);
    productRouter.post("/", uploadImageMiddleware, validateProductMiddleware, ProductController.create);
    productRouter.patch("/:id", uploadImageMiddleware, validateProductMiddleware, ProductController.update);
    productRouter.delete("/:id", ProductController.delete);
    productRouter.get("/product-discounts-ranges/:id", ProductController.getDiscountsRanges);
    return productRouter;
};
export default createProductsRouter;
