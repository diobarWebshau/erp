import type {
    IPurchasedOrder,
    IPartialPurchasedOrder,
} from "../../../interfaces/purchasedOrder";
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../store/store";

const API_URL =
    "http://localhost:3003/production/purchased-orders";

const fetchPurchasedOrdersFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IPurchasedOrder[]> => {
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
                    key: "purchasedOrders",
                    message: errorText
                })
            );
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
    id: number,
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
    id: number,
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
    fetchPurchasedOrdersLike
};
