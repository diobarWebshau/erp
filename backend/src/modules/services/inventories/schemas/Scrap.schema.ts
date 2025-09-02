import zod from "zod";

const ScrapSchema = zod.object({
    reference_type: zod.enum([
        "Production",
        "Inventory",
        "Shipping"
    ]),
    reference_id: zod.number(),
    location_id: zod.number().optional(),
    location_name: zod.string().optional(),
    item_id: zod.number(),
    item_type: zod.enum([
        "input",
        "product"
    ]),
    item_name: zod.string(),
    qty: zod.number(),
    reason: zod.string(),
    user_id: zod.number().optional(),
    user_name: zod.string().optional()
})

const validateSafeParse = (input: object) => {
    const result =
        ScrapSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await ScrapSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result = ScrapSchema
        .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await ScrapSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    ScrapSchema,
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync
}
