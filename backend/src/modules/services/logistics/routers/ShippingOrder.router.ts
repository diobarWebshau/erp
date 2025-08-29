import ShippingOrderController
    from "../controllers/ShippingOrders.controller.js";
import validateShippingOrderMiddleware
    from "../middleware/shipping-order/validationMiddleware.js";
import uploadImageMiddleware
    from "../../../../middlewares/multer/multerMiddleware.js";
import { Router } from "express";

const createShippingOrdersRouter = (): Router => {
    const shippingOrdersRouter = Router();
    shippingOrdersRouter.get("/",
        ShippingOrderController.getAll);
    shippingOrdersRouter.get("/:id",
        ShippingOrderController.getById);
    shippingOrdersRouter.get("/details/:id",
        ShippingOrderController.getDetailsById);
    shippingOrdersRouter.get("/:code",
        ShippingOrderController.getByCode);
    shippingOrdersRouter.post("/",
        uploadImageMiddleware,
        validateShippingOrderMiddleware,
        ShippingOrderController.create);
    shippingOrdersRouter.patch("/:id",
        uploadImageMiddleware,
        validateShippingOrderMiddleware,
        ShippingOrderController.update);
    shippingOrdersRouter.delete("/:id",
        ShippingOrderController.delete);
    shippingOrdersRouter.post("/complete",
        uploadImageMiddleware,
        validateShippingOrderMiddleware,
        ShippingOrderController.createComplete);
    shippingOrdersRouter.patch("/complete/:id",
        uploadImageMiddleware,
        validateShippingOrderMiddleware,
        ShippingOrderController.updateComplete);
    return shippingOrdersRouter;
}

export default createShippingOrdersRouter;