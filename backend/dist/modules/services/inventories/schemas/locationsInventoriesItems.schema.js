import zod from "zod";
const locationInventoryItemSchema = zod.object({
    inventory_id: zod.number().int().min(1),
    location_id: zod.number().int().min(1),
    item_id: zod.number().int().min(1),
    item_type: zod.enum(["product", "input"]),
});
const validateSafeParse = (input) => {
    const result = locationInventoryItemSchema.
        safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await locationInventoryItemSchema.
        safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = locationInventoryItemSchema.
        partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await locationInventoryItemSchema.
        partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, locationInventoryItemSchema };
