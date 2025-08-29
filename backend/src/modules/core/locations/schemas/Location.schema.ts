import zod from "zod";
import {
    locationTypeSchema
} from "./LocationType.schema.js";

const locationSchema = zod.object({
    name:
        zod.string().min(1, "Name is required"),
    description:
        zod.string().min(1, "Description is required"),
    types:
        zod.array(locationTypeSchema).optional(),
    is_active:
        zod.boolean().optional(),
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

