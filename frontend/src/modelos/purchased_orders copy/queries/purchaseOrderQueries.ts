import type { IPurchasedOrder, IPartialPurchasedOrder } from "../../../interfaces/purchasedOrder";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "production/purchased-orders/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);


const fetchPurchasedOrdersFromDB = async ({
    dispatch,
    like,
    conditionsExclude,
    signal
}: {
    dispatch: AppDispatchRedux,
    like?: string,
    conditionsExclude?: IPartialPurchasedOrder,
    signal?: AbortSignal
}): Promise<IPurchasedOrder[]> => {
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
            dispatch(setError({ key: "purchasedOrders", message: errorText }));
            return [];
        }

        dispatch(clearError("purchasedOrders"));

        const data: IPurchasedOrder[] = await response.json();

        return data;
    } catch (error: unknown) {
        // Ignoramos abortError, solo lanzamos otros errores
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("abort");
            return []; // fetch cancelado, retornamos vacío
        }
        throw error;
    }
};

const getPurchasedOrderByIdInDB = async (
    dispatch: AppDispatchRedux,
    id: number | undefined | null
): Promise<IPurchasedOrder | null> => {
    try {
        const response = await fetch(`${API_URL}/id/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
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
                    key: "getAllDetailsPurchasedOrder",
                    message: errorText
                })
            )
            return null;
        }
        dispatch(
            clearError("purchasedOrders")
        );
        const data: IPurchasedOrder = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

const getPurchasedOrderByIdsInDB = async (
    dispatch: AppDispatchRedux,
    id: number | number[],
    signal?: AbortSignal
): Promise<IPurchasedOrder[] | null> => {
    try {
        /* Generamos los params */
        const params = new URLSearchParams();
        if (Array.isArray(id)) {
            id.forEach((v) => params.append("id", v.toString()));
        } else {
            params.append("id", id.toString());
        }

        /* Generamos la URL */
        const url = new URL(`ids`, API_URL); // respeta tu uso de '/ids'
        url.search = params.toString();


        /* Generamos el request */
        const request = new Request(url.toString(), {
            method: "GET",
            signal,
        });

        /* Realizamos la petición */
        const response = await fetch(request);

        /* Validamos la respuesta */
        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "getAllDetailsPurchasedOrder",
                    message: errorText
                })
            )
            return null;
        }

        // Limpia la MISMA clave que usaste al setear
        dispatch(clearError("getAllDetailsIdsPurchasedOrder"));

        const data: unknown = await response.json();

        return data as IPurchasedOrder[];
    } catch (error: unknown) {
        // Ignoramos abortError, solo lanzamos otros errores
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("abort");
            return []; // fetch cancelado, retornamos vacío
        }
        throw error;
    }
};

const fetchPurchasedOrdersLike = async (
    query: string
): Promise<IPurchasedOrder[]> => {
    if (!query || query.trim().length === 0) return [];

    const encodedQuery = encodeURIComponent(query);

    try {
        const response = await fetch(`http://localhost:3003/production/purchased-orders/like/${encodedQuery}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const products: IPurchasedOrder[] = await response.json();
        console.log(products);
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

const getAllDetailsPurchasedOrderByIdInDB = async (
    dispatch: AppDispatchRedux,
    id: number
): Promise<IPurchasedOrder[]> => {
    try {
        const response = await fetch(`${API_URL}/details/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
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
                    key: "getAllDetailsPurchasedOrder",
                    message: errorText
                })
            )
            return [];
        }
        dispatch(
            clearError("purchasedOrders")
        );
        const data: IPurchasedOrder[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}


const createPurchasedOrderInDB = async (
    data: IPartialPurchasedOrder,
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
            dispatch(
                setError({
                    key: "createPurchasedOrder",
                    message: errorText
                })
            );
            throw new Error(
                `${errorText}`
            );
        }
        dispatch(
            clearError("createPurchasedOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const createBatchPurchasedOrderInDB = async (
    data: IPartialPurchasedOrder,
    dispatch: AppDispatchRedux
): Promise<IPartialPurchasedOrder | null> => {
    try {
        const response = await fetch(`${API_URL}/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText);
            dispatch(
                setError({
                    key: "createPurchasedOrder",
                    message: errorText
                })
            );
            throw new Error(
                `${errorText}`
            );
        }

        dispatch(
            clearError("createBatchPurchasedOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updatePurchasedOrderInDB = async (
    id: number | undefined,
    data: IPartialPurchasedOrder,
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
                    key: "updatePurchasedOrder",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updatePurchasedOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deletePurchasedOrderInDB = async (
    id: number | undefined,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/delete-secure/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.json();
            dispatch(
                setError({
                    key: "deletePurchasedOrder",
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
            clearError("deletePurchasedOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

export {
    fetchPurchasedOrdersFromDB,
    getPurchasedOrderByIdInDB,
    createPurchasedOrderInDB,
    createBatchPurchasedOrderInDB,
    updatePurchasedOrderInDB,
    deletePurchasedOrderInDB,
    getAllDetailsPurchasedOrderByIdInDB,
    fetchPurchasedOrdersLike,
    getPurchasedOrderByIdsInDB
};
