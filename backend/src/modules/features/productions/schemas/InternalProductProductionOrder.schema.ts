import zod from "zod";

const internalProductProductionOrderSchema = zod.object({
    product_id: zod.number().int().min(1),
    location_id: zod.number().int().min(1),
    qty: zod.number().min(1),
});

const validateSafeParse = (input: object) => {
    const result =
        internalProductProductionOrderSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await internalProductProductionOrderSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        internalProductProductionOrderSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await internalProductProductionOrderSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    internalProductProductionOrderSchema
}