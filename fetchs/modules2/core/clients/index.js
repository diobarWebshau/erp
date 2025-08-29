import sendMultipleClients
    from "./clients/many.js";
import sendMultipleClientAddresses
    from "./clientAddresses/many.js";

const insertDataModuleClients = async () => {
    try {
        await sendMultipleClients();
        await sendMultipleClientAddresses();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleClients;