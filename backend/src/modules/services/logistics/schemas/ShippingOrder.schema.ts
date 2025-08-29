import zod from "zod";

// const logisticSchema = zod.object({
//     status: zod.string(),
//     carrier_id: zod.number(),
//     load_evidence: zod.array(zod.object({})),
//     delivery_cost: zod.number(),
// });

const loadEvidence = zod.object({
    path: zod.string(),
    id: zod.string()
})

const logisticSchema = zod.object({
    status: zod.string().optional(),
    carrier_id: zod.string(),
    delivery_cost: zod.string(),
    load_evidence: zod.any().optional(),
    load_evidence_old: zod.any().optional(),
    load_evidence_deleted: zod.any().optional(),
    delivery_date: zod.string(),
    shipping_date: zod.string()
});

const validateSafeParse = (input: object) => {
    const result = logisticSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result = await logisticSchema.safeParseAsync(input);
    return result;
}
const validatePartialSafeParse = (input: object) => {
    const result = logisticSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result = await logisticSchema.partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    logisticSchema
}