import zod from "zod";
const productionOrderSchema = zod.object({
    order_type: zod.enum(["internal", "client"]),
    order_id: zod.number().int().min(1).optional(),
    qty: zod.number().min(0),
    status: zod.string().optional(),
    product_id: zod.number().int().min(1),
    product_name: zod.string().optional(),
    product: zod.any().optional(),
    production_line: zod.any().optional(),
    location: zod.any().optional(),
    purchase_order: zod.any().optional(),
});
const validateSafeParse = (input) => {
    const result = productionOrderSchema.safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await productionOrderSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = productionOrderSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await productionOrderSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, productionOrderSchema };
