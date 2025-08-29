import zod from "zod"

const purchaseOrderProductSchema = zod.object({
    purchase_order_id: zod.number().int().min(1).nullable(),
    product_id: zod.number().int().min(1).nullable(),
    qty: zod.number().min(0),
    status: zod.string().optional(),
    //,recorded_price: zod.number().min(0)
});

const validateSafeParse = (input: object) => {
    const result = purchaseOrderProductSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result = await purchaseOrderProductSchema.safeParseAsync(input);
    return result;
}
const validatePartialSafeParse = (input: object) => {
    const result = purchaseOrderProductSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result = await purchaseOrderProductSchema.partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    purchaseOrderProductSchema
}
