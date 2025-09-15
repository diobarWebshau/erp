import type { IPartialProductionLineQueue, IProductionLineQueue } from "../../../interfaces/productionLineQueue";
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../store/store";

const API_URL =
    "http://localhost:3003/production/production-line-queue";

const fetchProductionLineQueueFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IProductionLineQueue[]> => {
    try {
        const response = await fetch(API_URL, {
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
                    key: "ProductionLineQueue",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("ProductionLineQueue")
        );
        const data: IProductionLineQueue[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const updateProductionLineQueue = async (
    production_line_id: number,
    data: IPartialProductionLineQueue[],
    dispatch: AppDispatchRedux
) => {

    try {
        const response = await fetch(`${API_URL}/reorder/${production_line_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productionOrders: data,
                mode: "full"
            }),
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
                    key: "updateProductionLineQueue",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("updateProductionLineQueue")
        );
        const responseData: IProductionLineQueue[] = await response.json();
        return responseData;
    } catch (error: unknown) {
        throw error;
    }
}


const fetchProductionLineQueueById = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<IProductionLineQueue | null> => {
    try {
        const response = await fetch(`${API_URL}/id/${id}`, {
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
                    key: "ProductionLineQueueById",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("ProductionLineQueueById")
        );
        const data: IProductionLineQueue = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}


export {
    fetchProductionLineQueueFromDB,
    updateProductionLineQueue,
    fetchProductionLineQueueById,
}