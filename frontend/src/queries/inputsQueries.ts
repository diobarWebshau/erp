import type {
    IPartialInput,
    IInput
} from "../interfaces/inputs";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/production/inputs";

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

const createInputInDB = async (
    data: IPartialInput,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "createInput",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createInput")
        );
        const result = await response.json();
        return result;
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
    const request = new Request(`${API_URL}/create-complete`, {
        method: "POST",
        body: formData
    });
    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: unknown = null;
        try {
            errorBody = await response.json();
        } catch {/**/ }
        const message =
            typeof errorBody === "string"
                ? errorBody
                : (errorBody as any)?.message
                ?? `Request failed with status ${response.status}`;
        throw new Error(message);
    }
    return await response.json();
}

const updateInputInDB = async (
    id: number,
    data: IPartialInput,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText =
                await response.json();

            if (response.status >= 500)
                throw new Error(
                    errorText
                );
            dispatch(
                setError({
                    key: "updateInput",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateInput")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateCompleteInputInDB = async (
    id: number,
    data: IPartialInput,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                // No hacemos append si el valor es null o undefined
                return;
            } else if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === "object") {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value.toString());
            }
        });


        const response = await fetch(`${API_URL}/update-complete/${id}`, {
            method: "PATCH",
            body: formData
        });

        if (!response.ok) {
            const errorText =
                await response.json();
            console.log(errorText);
            if (response.status >= 500)
                throw new Error(
                    errorText
                );
            dispatch(
                setError({
                    key: "updateInputComplete",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateInputComplete")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteInputInDB = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.json();
            dispatch(
                setError({
                    key: "deleteInput",
                    message: errorText
                })
            );
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            return null;
        }

        dispatch(
            clearError("deleteInput")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchInputsFromDB,
    createInputInDB,
    updateInputInDB,
    deleteInputInDB,
    fetchInputWithTypeByIdFromDB,
    createCompleteInput,
    updateCompleteInputInDB
};
