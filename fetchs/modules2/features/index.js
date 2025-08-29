import insertDataModuleProduction from "./production/index.js";

const insertDataModuleFeatures = async () => {
    try {
        await insertDataModuleProduction();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleFeatures;