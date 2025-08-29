import type {
    IInternalProductProductionOrder,
    IPartialInternalProductProductionOrder
} from "../models/internal-orders/structure/types";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/production/internal-product-production-orders";

const fetchInternalOrdersFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IInternalProductProductionOrder[]> => {
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
                    key: "InternalOrders",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("InternalOrders")
        );
        const data: IInternalProductProductionOrder[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const revertProductionOrderOfInternalOrderFromDB = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<IInternalProductProductionOrder[]> => {
    try {
        const response = await fetch(`${API_URL}/revert-order-production/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText)
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "revertProductionOrderOfInternalOrder",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("revertProductionOrderOfInternalOrder")
        );
        const data: IInternalProductProductionOrder[] = []
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createInternalOrderInDB = async (
    data: IPartialInternalProductProductionOrder,
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
                    key: "createInternalOrder",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createInternalOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateInternalOrderInDB = async (
    id: number,
    data: IPartialInternalProductProductionOrder,
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
                    key: "updateInternalOrder",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateInternalOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteInternalOrderInDB = async (
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
                    key: "deleteInternalOrder",
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
            clearError("deleteInternalOrder")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchInternalOrdersFromDB,
    createInternalOrderInDB,
    updateInternalOrderInDB,
    deleteInternalOrderInDB,
    revertProductionOrderOfInternalOrderFromDB
};
