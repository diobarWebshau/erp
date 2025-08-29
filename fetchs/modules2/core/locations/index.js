
import sendMultipleLocations
    from "./locations/many.js";
import sendMultipleLocationTypes
    from "./location_types/many.js";
import sendMultipleLocationLocationType
    from "./locations_location_types/many.js";

const insertDataModuleLocations = async () => {
    try {
        await sendMultipleLocations();
        await sendMultipleLocationTypes();
        await sendMultipleLocationLocationType();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleLocations;