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
});
const logisticSchema = zod.object({
    status: zod.string().optional(),
    carrier_id: zod.string(),
    delivery_cost: zod.string(),
    load_evidence: zod.any().optional(),
    load_evidence_old: zod.any().optional(),
    load_evidence_deleted: zod.any().optional(),
    delivery_date: zod.string().optional(),
    shipping_date: zod.string().optional(),
    tracking_number: zod.string().optional(),
    shipment_type: zod.string().optional(),
    transport_method: zod.string().optional(),
    comments: zod.string().optional(),
    comments_finish: zod.string().optional(),
    received_by: zod.string().optional(),
    user_id: zod.string().optional(),
    user_name: zod.string().optional(),
    scheduled_ship_date: zod.string().optional(),
    finished_date: zod.string().optional(),
});
const validateSafeParse = (input) => {
    const result = logisticSchema.safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await logisticSchema.safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = logisticSchema.partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await logisticSchema.partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, logisticSchema };
