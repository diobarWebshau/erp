import { locationTypeSchema } from "./LocationType.schema.js";
import zod from "zod";

const locationSchema = zod.object({
    name: zod.string().min(1, "Name is required").optional(),
    description: zod.string().min(1, "Description is required").optional(),
    street: zod.string().min(1, "Street is required").optional(),
    custom_id: zod.string().min(1, "Custom id  is required").optional(),
    location_manager: zod.string().min(1, "Custom id  is required").optional(),
    street_number: zod.number().int().optional(),
    neighborhood: zod.string().min(1, "Neighborhood is required").optional(),
    city: zod.string().min(1, "City is required").optional(),
    state: zod.string().min(1, "State is required").optional(),
    country: zod.string().min(1, "Country is required").optional(),
    zip_code: zod.number().int().optional(),
    phone: zod.string().min(1, "Phone is required").optional(),
    types: zod.array(locationTypeSchema).optional(),
    production_capacity: zod.number().optional(),
    is_active: zod.preprocess(
        (val) => {
            if (typeof val === "boolean") return val;
            if (val === "true" || val === "1" || val === 1) return true;
            if (val === "false" || val === "0" || val === 0) return false;
            return val;
        },
        zod.boolean({ required_error: "Active is required", invalid_type_error: "Active must be a boolean" })
    ).optional(),
});

const validateSafeParse = (input: object) => {
    const result = locationSchema
        .safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await locationSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        locationSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result = await
            locationSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync
}

export type {
    locationSchema
}

