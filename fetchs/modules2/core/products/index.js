import sendMultipleProductDiscountRanges
    from "./productDiscountsRanges/many.js";
import sendMultipleProducts
    from "./products/many.js";

const insertDataModuleProducts = async () => {
    try {
        await sendMultipleProducts();
        await sendMultipleProductDiscountRanges();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleProducts;