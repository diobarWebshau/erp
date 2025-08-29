import zod from "zod";

const productionSchema = zod.object({
    production_order_id: zod.number().int().min(1),
    product_id: zod.number().int().min(1),
    qty: zod.number().min(0)
});

const validateSafeParse = (input: object) => {
    const result =
        productionSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await productionSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        productionSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await productionSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    productionSchema
}