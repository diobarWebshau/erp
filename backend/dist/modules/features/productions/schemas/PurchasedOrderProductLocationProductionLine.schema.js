import zod from "zod";
const purchasedOrderProductLocationProductionLineSchema = zod.object({
    production_line_id: zod.number().int().min(1),
    purchase_order_product_id: zod.number().int().min(1)
});
const validateSafeParse = (input) => {
    const result = purchasedOrderProductLocationProductionLineSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await purchasedOrderProductLocationProductionLineSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = purchasedOrderProductLocationProductionLineSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await purchasedOrderProductLocationProductionLineSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, purchasedOrderProductLocationProductionLineSchema };
