import zod from "zod";

const shippingOrderPurchaseOrderProductSchema = zod.object({
    shipping_order_id:
        zod.number().int().min(1),
    purchase_order_product_id:
        zod.number().int().min(1)
});

const validateSafeParse = (input: object) => {
    const result =
        shippingOrderPurchaseOrderProductSchema
            .safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result =
        await shippingOrderPurchaseOrderProductSchema
            .safeParseAsync(input);
    return result;
}

const validatePartialSafeParse = (input: object) => {
    const result =
        shippingOrderPurchaseOrderProductSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result =
        await shippingOrderPurchaseOrderProductSchema
            .partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    shippingOrderPurchaseOrderProductSchema
}