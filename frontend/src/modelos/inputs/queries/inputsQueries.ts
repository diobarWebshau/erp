import type { IApiError } from "../../../interfaces/errorApi";
import type { IPartialInput, IInput } from "../../../interfaces/inputs";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "production/inputs/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

const fetchInputsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IInput[]> => {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "Inputs",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("Inputs")
        );
        const data: IInput[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const fetchInputWithTypeByIdFromDB = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<IInput | null> => {
    try {
        const response = await fetch(`${API_URL}/types/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "inputsWithTypeFromDB",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("inputsWithTypeFromDB")
        );
        const data: IInput = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createCompleteInput = async ({ input }: { input: IPartialInput }): Promise<IPartialInput> => {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
        if (value == null) return;
        // Array de Files
        if (Array.isArray(value) && value.every(v => v instanceof File)) {
            value.forEach((file) => formData.append(key, file));
            return;
        }
        // Array NO de files → JSON
        if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Un solo File
        if (value instanceof File) {
            formData.append(key, value);
            return;
        }
        // Objetos → JSON
        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Primitivos
        formData.append(key, value.toString());
    });
    const url = new URL(`create-complete`, API_URL);
    const request = new Request(url.toString(), { method: "POST", body: formData });
    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch {/**/ }
        const apiError: IApiError = {
            status: response.status,
            message: errorBody?.message,
            validation: errorBody?.validation,
            code: errorBody?.code,
        };
        throw apiError;
    }
    return await response.json();
}

const updateCompleteInputInDB = async ({ id, input }: { id: number | undefined, input: IPartialInput }): Promise<any> => {
    if (!id) throw new Error("No id provided to updateCompleteInputInDB");
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
        if (value == null) return;
        // Array de Files
        if (Array.isArray(value) && value.every(v => v instanceof File)) {
            value.forEach((file) => formData.append(key, file));
            return;
        }
        // Array NO de files → JSON
        if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Un solo File
        if (value instanceof File) {
            formData.append(key, value);
            return;
        }
        // Objetos → JSON
        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Primitivos
        formData.append(key, value.toString());
    });
    const url = new URL(`update-complete/${encodeURIComponent(id)}`, API_URL);
    const request = new Request(url.toString(), { method: "PATCH", body: formData });
    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch {/**/ }
        const apiError: IApiError = {
            status: response.status,
            message: errorBody?.message,
            validation: errorBody?.validation,
            code: errorBody?.code,
        };
        throw apiError;
    }
    return await response.json();
};

const deleteInputInDB = async ({ id }: { id: number }): Promise<any> => {
    const url = new URL(`${encodeURIComponent(id)}`, API_URL);
    const request = new Request(url.toString(), {
        method: "DELETE"
    });
    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch {/**/ }
        const apiError: IApiError = {
            status: response.status,
            message: errorBody?.message,
            validation: errorBody?.validation,
            code: errorBody?.code,
        };
        throw apiError;
    }
    return;
};

export {
    fetchInputsFromDB,
    deleteInputInDB,
    fetchInputWithTypeByIdFromDB,
    createCompleteInput,
    updateCompleteInputInDB
};
