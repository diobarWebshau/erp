import zod from "zod";
const PurchasedOrderSchema = zod.object({
    order_code: zod.string().min(1, "Order code is required").optional(),
    delivery_date: zod.coerce.date(), // Convierte automáticamente una string en Date
    status: zod.string().min(1, "Status is required").optional(),
    // client fields
    client_id: zod.number().min(1, "Client id is required"),
    // company_name: zod.string().min(1, "Company name is required"),
    // tax_id: zod.string().min(1, "Tax id is required"),
    // email: zod.string().email("Email must be valid"),
    // phone: zod.string().min(1, "Phone is required"),
    // city: zod.string().min(1, "City is required"),
    // state: zod.string().min(1, "State is required"),
    // country: zod.string().min(1, "Country is required"),
    // address: zod.string().min(1, "Address is required"),
    // payment_terms: zod.string().min(1, "Payment terms is required"),
    // zip_code: zod.string().min(1, "Zip code is required"),
    // tax_regimen: zod.string().min(1, "Tax regimen is required"),
    // cfdi: zod.string().min(1, "Cfdi is required"),
    // payment_method: zod.string().min(1, "Payment method is required"),
    // shipping fields(client address)
    client_address_id: zod.number().min(1, "Client address id is required"),
    street: zod.string().min(1, "Street is required"),
    street_number: zod.number().int(),
    neighborhood: zod.string().min(1, "Neighborhood is required"),
    city: zod.string().min(1, "City is required"),
    state: zod.string().min(1, "State is required"),
    country: zod.string().min(1, "Country is required"),
    zip_code: zod.number().int(),
    shipping_street: zod.string().min(1, "Shipping street is required"),
    shipping_street_number: zod.number().int(),
    shipping_neighborhood: zod.string().min(1, "Shipping neighborhood is required"),
    shipping_city: zod.string().min(1, "Shipping city is required"),
    shipping_state: zod.string().min(1, "Shipping state is required"),
    shipping_country: zod.string().min(1, "Shipping country is required"),
    shipping_zip_code: zod.number().int(),
    total_price: zod.number().min(0, "Total price is required"),
    purchase_order_products: zod.any()
});
const validateSafeParse = (input) => {
    const result = PurchasedOrderSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await PurchasedOrderSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = PurchasedOrderSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await PurchasedOrderSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, PurchasedOrderSchema };
