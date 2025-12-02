import type { IApiError } from "interfaces/errorApi";
import type { IPurchasedOrder, IPartialPurchasedOrder } from "../../../interfaces/purchasedOrder";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import type { IPartialLocation } from "interfaces/locations";

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


// *************** POST *************** //

type ICreateLocationDBProps = {
    location: IPartialLocation
}

const createCompleteLocationInDB = async ({ location }: ICreateLocationDBProps): Promise<IPartialLocation> => {
    const url = new URL('create-complete', API_URL);
    const request = new Request(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location)
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
    return await response.json();
};

// *************** PATCH *************** //

interface IUpdateCompletePurchasedOrderInDBProps {
    id: number,
    purchasedOrder: IPartialPurchasedOrder
}

const updateCompletePurchasedOrderInDB = async ({ id, purchasedOrder }: IUpdateCompletePurchasedOrderInDBProps): Promise<IPartialPurchasedOrder> => {
    if (!id) throw new Error("No id provided to updateCompletePurchasedOrderInDB");
    const url = new URL(`update-complete/${encodeURIComponent(id)}`, API_URL);
    console.log('url', url)
    const request = new Request(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchasedOrder)
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
        console.log("APIERROR ", apiError);
        throw apiError;
    }
    return await response.json();
};

// *************** DELETE *************** //

interface IDeletePurchasedOrderInDBProps {
    id: number
}

const deletePurchasedOrderInDB = async ({ id }: IDeletePurchasedOrderInDBProps): Promise<void> => {
    if (!id) throw new Error("No id provided to deletePurchasedOrderInDB");
    const url = new URL(`${encodeURIComponent(id)}`, API_URL);
    const request = new Request(url.toString(), {
        method: "DELETE",
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
    // 204 → sin body, simplemente resolvemos
    return;
};

export {
    fetchPurchasedOrdersFromDB,
    getPurchasedOrderByIdInDB,
    createCompleteLocationInDB,
    deletePurchasedOrderInDB,
    getAllDetailsPurchasedOrderByIdInDB,
    fetchPurchasedOrdersLike,
    getPurchasedOrderByIdsInDB,
    updateCompletePurchasedOrderInDB
};
