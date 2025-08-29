import zod from "zod";

const productionOrderSchema = zod.object({
    order_type: zod.enum(["internal", "client"]),
    order_id: zod.number().int().min(1),
    qty: zod.number().min(0),
    status: zod.string().optional(),
});

const validateSafeParse = (input: object) => {
    const result =
        productionOrderSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await productionOrderSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        productionOrderSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await productionOrderSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    productionOrderSchema
}