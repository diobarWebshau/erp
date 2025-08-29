import zod from "zod";

const inventoryTransferSchema = zod.object({
    item_type: zod.enum(["product", "input"]),
    item_id: zod.number().int().min(0), 
    qty: zod.number().min(0, {
        message: "Quantity must be zero or more"
    }),
    reason: zod.string().min(1, {
        message: "Reason is required"
    }),
    status: zod.string().optional(),
    source_location_id:zod.number().int().min(0),
    destination_location_id: zod.number().int().min(0),
});

const validateSafeParse = (input: object) => {
    return inventoryTransferSchema.safeParse(input);
};

const validateSafeParseAsync = async (input: object) => {
    return await inventoryTransferSchema.safeParseAsync(input);
};

const validatePartialSafeParse = (input: object) => {
    return inventoryTransferSchema.
        partial().safeParse(input);
};

const validatePartialSafeParseAsync = async (input: object) => {
    return await inventoryTransferSchema.
        partial().safeParseAsync(input);
};

export {
    inventoryTransferSchema,
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync
};
