import type {
    IPartialProductionOrder,
    IProductionOrder
} from "../interfaces/productionOrder";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/production/production-orders";

const fetchProductionOrdersFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IProductionOrder[]> => {
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
                    key: "productionOrders",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("productionOrders")
        );
        const data: IProductionOrder[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createProductionOrderInDB = async (
    data: IPartialProductionOrder,
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
            if (response.status > 500) {
                throw new Error(JSON.stringify(errorText));
            }
            dispatch(
                setError({
                    key: "createProductionOrder",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createProductionOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateProductionOrderInDB = async (
    id: number,
    data: IPartialProductionOrder,
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
                    key: "updateProductionOrder",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateProductionOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteProductionOrderInDB = async (
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
                    key: "deleteProductionOrder",
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
            clearError("deleteProductionOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

export {
    fetchProductionOrdersFromDB,
    createProductionOrderInDB,
    updateProductionOrderInDB,
    deleteProductionOrderInDB,
};
