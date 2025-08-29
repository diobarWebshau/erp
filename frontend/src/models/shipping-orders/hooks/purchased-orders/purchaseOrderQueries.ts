import type {
    IPurchasedOrder,
    IPartialPurchasedOrder,
} from "../../../../interfaces/purchasedOrder";
import {
    setError,
    clearError,
} from "../../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../../store/store";

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
        const data: IPurchasedOrder[] =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const fetchPurchasedOrdersProductByAddressFromDB = async (
    dispatch: AppDispatchRedux,
    client_address_id: number | undefined
): Promise<IPurchasedOrder[]> => {
    try {
        const response = await fetch(`${API_URL}/address/${client_address_id}`, {
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
                    key: "purchasedOrdersByAddress",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("purchasedOrdersByAddress")
        );
        const data: IPurchasedOrder[] =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


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
            return null;
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
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/batch`, {
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
            return null;
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
        const response = await fetch(`${API_URL}/${id}`, {
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
    fetchPurchasedOrdersProductByAddressFromDB,
    createPurchasedOrderInDB,
    createBatchPurchasedOrderInDB,
    updatePurchasedOrderInDB,
    deletePurchasedOrderInDB,
};
