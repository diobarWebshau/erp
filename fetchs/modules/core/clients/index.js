import sendMultiplePurchasedOrders from "./purchased_order/many.js";
import sendMultipleClients from "./clients/many.js";
import sendMultipleClientAddresses from "./client_addresses/many.js";

const insertDataModuleClients = async () => {
    try {
        await sendMultipleClients();
        await sendMultipleClientAddresses();
        await sendMultiplePurchasedOrders();
    } catch (error) {
        console.error(error);
    }
}

export default insertDataModuleClients;