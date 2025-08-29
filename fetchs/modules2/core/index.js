import insertDataModuleClients
    from "./clients/index.js";
import insertDataModuleLocations
    from "./locations/index.js";
import insertDataModuleProducts
    from "./products/index.js";

const insertDataCoresModules = async () => {
    try {
        await insertDataModuleClients();
        await insertDataModuleLocations();
        await insertDataModuleProducts();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataCoresModules;