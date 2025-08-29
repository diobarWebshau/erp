import type {
    IPartialPurchasedOrderProduct, IPurchasedOrderProduct
} from "../../../../interfaces/purchasedOrdersProducts";
import {
    setError,
    clearError,
} from "../../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../../store/store";

const API_URL =
    "http://localhost:3003/production/purchased-orders-products";

const fetchPurchasedOrderProductsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IPurchasedOrderProduct[]> => {
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
                    key: "PurchasedOrderProducts",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("PurchasedOrderProducts")
        );
        const data: IPurchasedOrderProduct[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const getPurchasedOrderProductsByPOFromDB = async (
    dispatch: AppDispatchRedux,
    purchase_order_id:  number | undefined
): Promise<IPurchasedOrderProduct[]> => {
    try {
        const response = await fetch(`${API_URL}/orders-products/${purchase_order_id}`, {
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
                    key: "PurchasedOrderProducts",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("PurchasedOrderProducts")
        );
        const data: IPurchasedOrderProduct[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createPurchasedOrderProductInDB = async (
    data: IPartialPurchasedOrderProduct,
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
                    key: "createPurchasedOrderProduct",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createPurchasedOrderProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updatePurchasedOrderProductInDB = async (
    id: number,
    data: IPartialPurchasedOrderProduct,
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
                    key: "updatePurchasedOrderProduct",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updatePurchasedOrderProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deletePurchasedOrderProductInDB = async (
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
                    key: "deletePurchasedOrderProduct",
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
            clearError("deletePurchasedOrderProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchPurchasedOrderProductsFromDB,
    createPurchasedOrderProductInDB,
    updatePurchasedOrderProductInDB,
    deletePurchasedOrderProductInDB,
    getPurchasedOrderProductsByPOFromDB
};
