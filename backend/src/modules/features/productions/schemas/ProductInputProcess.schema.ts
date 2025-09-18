import zod from "zod";

// Si no tienes schemas base para los anidados, usa placeholders opcionales:
const baseProductInputSchema = zod.object({}).catchall(zod.any());
const baseProductProcessSchema = zod.object({}).catchall(zod.any());

const productInputProcessSchema = zod.object({
    product_id: zod.number().int().min(1).nullable(),
    product_input_id: zod.number().int().min(1).nullable(),
    product_process_id: zod.number().int().min(1).nullable(),
    // anidados opcionales (parciales) por si envías snapshots
    product_input: baseProductInputSchema.partial().optional(),
    product_process: baseProductProcessSchema.partial().optional()
});

const validateSafeParse = (input: object) => {
    const result = productInputProcessSchema.safeParse(input);
    return result;
};

const validateSafeParseAsync = async (input: object) => {
    const result = await productInputProcessSchema.safeParseAsync(input);
    return result;
};

const validatePartialSafeParse = (input: object) => {
    const result = productInputProcessSchema.partial().safeParse(input);
    return result;
};

const validatePartialSafeParseAsync = async (input: object) => {
    const result = await productInputProcessSchema.partial().safeParseAsync(input);
    return result;
};

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    productInputProcessSchema
};
