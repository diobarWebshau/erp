import sendMultipleInventories
    from "./inventories/many.js";
import sendMultipleInventoryLocationItems
    from "./inventories-locations-items/many.js";

const insertDataInventoriesModules = async () => {
    try {
        await sendMultipleInventories();
        await sendMultipleInventoryLocationItems();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataInventoriesModules;