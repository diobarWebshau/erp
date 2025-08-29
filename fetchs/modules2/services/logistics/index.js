import sendMultipleCarriers from "./carriers/many.js";
import sendMultipleShippingOrder from "./shipping_orders/many.js";

const insertDataModuleLogistics = async() => {
    try {
        await sendMultipleCarriers();
        // await sendMultipleShippingOrder();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleLogistics;