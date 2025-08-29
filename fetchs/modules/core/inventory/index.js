import sendMultipleInventories from "./many.js";

const insertDataModuleInventories = async () => {
    try {
        await sendMultipleInventories();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleInventories;