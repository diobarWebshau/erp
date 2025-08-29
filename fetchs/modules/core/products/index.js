import sendMultipleProductDiscountsRange
    from "./product-discounts-ranges/many.js";
import sendMultipleInputTypes
    from "./input-tipes/many.js";
import sendMultipleProcesses
    from "./processes/many.js";
import sendMultipleProducts
    from "./products/many.js";
import sendMultipleInputs
    from "./inputs/many.js";
import sendMultipleProductProcesses
    from "./products_processes/many.js";
import sendMultipleProductsInputs
    from "./products-inputs/many.js";

const insertDataModuleProducts = async () => {
    try {
        await sendMultipleInputTypes();
        await sendMultipleProducts();
        await sendMultipleInputs();
        await sendMultipleProcesses();
        await sendMultipleProductDiscountsRange();
        await sendMultipleProductsInputs();
        await sendMultipleProductProcesses();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleProducts;