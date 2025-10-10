import type {
    IPartialCarrier,
    ICarrier
} from "../../../interfaces/carriers";
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../store/store";

const API_URL =
    "http://localhost:3003/logistics/carriers";

// ? Funcion que permite hacer el parseo de la respuesta de la API de forma segura
async function safeParseJSON(response: Response): Promise<any | null> {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Obtiene la lista de transportistas desde el backend.
 * Maneja errores HTTP, abortos de petición y limpieza de errores previos.
 */
const fetchCarriersFromDB = async (
    dispatch: AppDispatchRedux,
    signal: AbortSignal
): Promise<ICarrier[]> => {
    try {
        // Realiza la petición al backend
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal, // permite cancelar la petición con AbortController
        });

        // Si la respuesta fue cancelada, lanza un error tipo AbortError
        if (signal.aborted) throw new DOMException("Request aborted", "AbortError");

        // Verifica el estado HTTP de la respuesta
        if (!response.ok) {
            // Intenta parsear el error si viene en JSON, si no devuelve texto plano
            const errorBody = await safeParseJSON(response);

            // Construye un mensaje legible
            const message =
                errorBody?.message ||
                errorBody?.error ||
                `Error ${response.status}: ${response.statusText}`;

            // Los errores 5xx se tratan como errores críticos (se propagan)
            if (response.status >= 500) {
                throw new Error(message);
            }

            // Los errores 4xx se despachan al store como errores de validación
            dispatch(setError({ key: "Carriers", message: { validation: message } }));
            return [];
        }

        // Si todo salió bien, limpia cualquier error previo
        dispatch(clearError("Carriers"));

        // Parseo seguro de la respuesta
        const data = (await safeParseJSON(response)) as ICarrier[];

        // Retorna la lista de carriers
        return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
        // Ignora errores por cancelación
        if (err instanceof DOMException && err.name === "AbortError") {
            console.warn("Petición de carriers cancelada.");
            throw err; // se relanza para que el hook lo maneje correctamente
        }

        // Captura cualquier otro tipo de error (red, parseo, etc.)
        const message =
            err instanceof Error ? err.message : "Unexpected error while fetching carriers";

        console.error("fetchCarriersFromDB error:", message);
        throw new Error(message);
    }
};



const createCarrierInDB = async (
    data: IPartialCarrier,
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
            console.log(errorText);
            dispatch(
                setError({
                    key: "createCarrier",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createCarrier")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateCarrierInDB = async (
    id: number,
    data: IPartialCarrier,
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
                    key: "updateCarrier",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateCarrier")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteCarrierInDB = async (
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
                    key: "deleteCarrier",
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
            clearError("deleteCarrier")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchCarriersFromDB,
    createCarrierInDB,
    updateCarrierInDB,
    deleteCarrierInDB,
};
