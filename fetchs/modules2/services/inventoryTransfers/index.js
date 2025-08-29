import sendMultipleInventoryTransfers from "./many.js";

const insertDataInventoryTransfersModules = async () => {
    try {
        await sendMultipleInventoryTransfers();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataInventoryTransfersModules;