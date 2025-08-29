import sendMultipleLocationProductionLine from "./production_lines_locations/many.js";
import sendMultipleLocationLocationTypes from "./locations_location_types/many.js";
import sendMultipleProductionLines from "./production_lines/many.js"
import sendMultipleLocationTypes from "./location_types/many.js";
import sendMultipleLocations from "./locations/many.js";

const insertDataModuleLocations = async () => {
    try {
        await sendMultipleLocationTypes();
        await sendMultipleLocations();
        await sendMultipleLocationLocationTypes();
        await sendMultipleProductionLines();
        await sendMultipleLocationProductionLine();
    } catch (error) {
        console.error(error);
    }
}

export default insertDataModuleLocations;