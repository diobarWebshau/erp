import type {
    IPartialShippingOrderPurchasedOrderProduct,
    IShippingOrderPurchasedOrderProduct
} from "../interfaces/shippingPurchasedProduct";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "";

const fetchShippingOrderProductFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IShippingOrderPurchasedOrderProduct[]> => {
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
                    key: "shippingOrderProduct",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("shippingOrderProduct")
        );
        const data: IShippingOrderPurchasedOrderProduct[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createShippingOrderProductInDB = async (
    data: IPartialShippingOrderPurchasedOrderProduct,
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
                    key: "createShippingOrderProduct",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createShippingOrderProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateShippingOrderProductInDB = async (
    id: number,
    data: IPartialShippingOrderPurchasedOrderProduct,
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
                    key: "updateShippingOrderProduct",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateShippingOrderProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteShippingOrderProductInDB = async (
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
                    key: "deleteShippingOrderProduct",
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
            clearError("deleteShippingOrderProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

export {
    fetchShippingOrderProductFromDB,
    createShippingOrderProductInDB,
    updateShippingOrderProductInDB,
    deleteShippingOrderProductInDB,
};
