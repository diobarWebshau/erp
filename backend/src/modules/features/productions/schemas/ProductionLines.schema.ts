import zod from "zod";

const productionLineSchema = zod.object({
    name: zod.string().min(1, "Name is required"),
    is_active: zod.boolean().optional(),
});

const validateSafeParse = (input: object) => {
    const result =
        productionLineSchema
            .safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result = await
            productionLineSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        productionLineSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result = await
            productionLineSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    productionLineSchema
}