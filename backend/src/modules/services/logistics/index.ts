import createCarrierRouter 
    from "./routers/Carriers.router.js";
import createShippingOrdersRouter 
    from "./routers/ShippingOrder.router.js";

const Logistic = {
    createShippingOrdersRouter,
    createCarrierRouter
}

export default Logistic;