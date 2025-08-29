import zod from "zod"

const locationProductionLineSchema = zod.object({
    production_line_id:
        zod.number().int().min(1).nullable(),
    location_id:
        zod.number().int().min(1).nullable(),
});

const validateSafeParse = (input: object) => {
    const result =
        locationProductionLineSchema
            .safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await locationProductionLineSchema
                .safeParseAsync(input);
        return result;
    }
const validatePartialSafeParse = (input: object) => {
    const result =
        locationProductionLineSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await locationProductionLineSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    locationProductionLineSchema
}
