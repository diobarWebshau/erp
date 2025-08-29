
import sendMultipleTableData
    from "./tables/many.js";
import sendMultipleOperations
    from "./operations/many.js";
import sendMultipleLogData
    from "./logs/many.js";

const insertDataModuleLogs = async () => {
    try {
        await sendMultipleTableData();
        await sendMultipleOperations();
        await sendMultipleLogData();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleLogs;