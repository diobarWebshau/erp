import zod from "zod";
const InventoryMovementSchema = zod.object({
    location_id: zod.number().int().min(1),
    location_name: zod.string(),
    item_id: zod.number().int().min(1),
    item_type: zod.enum([
        "product", "input"
    ]),
    qty: zod.number().min(0),
    movement_type: zod.enum([
        "in", "out"
    ]),
    reference_id: zod.number().int().min(1).optional().nullable(),
    reference_type: zod.enum([
        "Production Order", "Order",
        "Transfer", "Purchased", "Scrap", "Internal Production Order"
    ]).optional(),
    production_id: zod.number().int().optional().nullable(),
    description: zod.string().optional().nullable(),
});
const validateSafeParse = (input) => {
    const result = InventoryMovementSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await InventoryMovementSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = InventoryMovementSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await InventoryMovementSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, InventoryMovementSchema };
