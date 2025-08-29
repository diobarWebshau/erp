import type {
    IPartialInventoryTransfer,
    IInventoryTransfer
} from "../interfaces/inventoryTransfer";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/inventory-transfers";

const fetchInventoryTransferFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IInventoryTransfer[]> => {
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
                    key: "InventoryTransfer",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("InventoryTransfer")
        );
        const data: IInventoryTransfer[] =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createInventoryTransferInDB = async (
    data: IPartialInventoryTransfer,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText);
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "createInventoryTransfer",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createInventoryTransfer")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};



const updateInventoryTransferInDB = async (
    id: number,
    data: IPartialInventoryTransfer,
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
                    key: "updateInventoryTransfer",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateInventoryTransfer")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const deleteInventoryTransferInDB = async (
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
                    key: "deleteInventoryTransfer",
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
            clearError("deleteInventoryTransfer")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchInventoryTransferFromDB,
    createInventoryTransferInDB,
    updateInventoryTransferInDB,
    deleteInventoryTransferInDB,
};
