import type {
    IShippingOrder,
    IPartialShippingOrder
} from "../../../interfaces/shippingOrder";
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../store/store";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "/logistics/shipping-orders";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

const fetchShippingOrdersFromDB = async ({
    dispatch,
    like,
    conditionsExclude,
    signal
}: {
    dispatch: AppDispatchRedux,
    like?: string,
    conditionsExclude?: IPartialShippingOrder,
    signal?: AbortSignal
}): Promise<IShippingOrder[]> => {
    try {
        // Creamos el objeto params
        const params = new URLSearchParams();

        // Agregamos el parametro de busqueda si se cumple ciertas condiciones
        if (like) params.set("filter", like);

        // Agregamos los params de exclusion si se cumplen ciertas condiciones
        if (conditionsExclude && Object.keys(conditionsExclude).length > 0) {
            Object.entries(conditionsExclude).forEach(([key, value]) => {
                if (Array.isArray(value) || typeof value === "object") {
                    params.set(key, JSON.stringify(value));
                } else {
                    params.set(key, value.toString());
                }
            });
        };

        // Creamos el request 
        const request = new Request(`${API_URL}?${params.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal,
        });

        // Realizamos la peticion a la DB
        const response = await fetch(request);

        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText);
            if (response.status >= 500) throw new Error(`${errorText}`)
            dispatch(setError({ key: "shippingOrders", message: errorText }));
            return [];
        }

        dispatch(clearError("shippingOrders"));

        const data: IShippingOrder[] = await response.json();

        return data;
    } catch (error: unknown) {
        console.log(error);
        // Ignoramos abortError, solo lanzamos otros errores
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("abort");
            return []; // fetch cancelado, retornamos vacío
        }
        throw error;
    }
};


const fetchShippingOrderDetailByIdFromDB = async (
    dispatch: AppDispatchRedux,
    id: number | undefined,
    signal: AbortSignal
): Promise<IShippingOrder | null> => {
    try {
        const response = await fetch(API_URL + "/details/" + id, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal,
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
                    key: "shippingOrderDetailById",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("shippingOrderDetailById")
        );
        const data: IShippingOrder = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};





const createShippingOrderInDB = async (
    data: IPartialShippingOrder,
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
                    key: "createShippingOrder",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createShippingOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const createCompleteShippingOrderInDB = async (
    data: IPartialShippingOrder,
    dispatch: AppDispatchRedux
): Promise<IShippingOrder | null> => {
    try {

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                return;
            }
            // 👇 Si es arreglo de File
            if (Array.isArray(value) && value.every(v => v instanceof File)) {
                value.forEach((file) => {
                    formData.append(key, file); // o `${key}` si el backend no usa []
                });
            }
            // 👇 Si es un solo File
            else if (value instanceof File) {
                formData.append(key, value);
            }
            // 👇 Si es un objeto común (no File ni array de File)
            else if (typeof value === "object") {
                formData.append(key, JSON.stringify(value));
            }
            // 👇 Para primitivos: string, number, boolean
            else {
                formData.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_URL}/complete`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText);
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(setError({ key: "createCompleteShippingOrder", message: errorText }));
            return null;
        }
        dispatch(clearError("createCompleteShippingOrder"));
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateCompleteShippingOrderInDB = async (
    id: number | null,
    data: IPartialShippingOrder,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        if (!id) return;
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                return;
            }
            // 👇 Si es arreglo de File
            if (Array.isArray(value) && value.every(v => v instanceof File)) {
                value.forEach((file) => {
                    formData.append(key, file); // o `${key}` si el backend no usa []
                });
            }
            // 👇 Si es un solo File
            else if (value instanceof File) {
                formData.append(key, value);
            }
            // 👇 Si es un objeto común (no File ni array de File)
            else if (typeof value === "object") {
                formData.append(key, JSON.stringify(value));
            }
            // 👇 Para primitivos: string, number, boolean
            else {
                formData.append(key, value.toString());
            }
        });

        const response = await fetch(API_URL + "/complete/" + id, {
            method: "PATCH",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText);
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "updateCompleteShippingOrder",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("updateCompleteShippingOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteShippingOrderInDB = async (
    id: number | null,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        if (!id) return;
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.json();
            dispatch(
                setError({
                    key: "deleteShippingOrder",
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
            clearError("deleteShippingOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

export {
    fetchShippingOrdersFromDB,
    createCompleteShippingOrderInDB,
    createShippingOrderInDB,
    updateCompleteShippingOrderInDB,
    deleteShippingOrderInDB,
    fetchShippingOrderDetailByIdFromDB,
};
