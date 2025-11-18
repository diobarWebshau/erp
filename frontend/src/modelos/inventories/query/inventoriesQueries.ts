import type {
    IInventory, IInventoryDetails, IItemInventory, IPartialInventory
} from "../../../interfaces/inventories";
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../store/store";

const API_URL =
    "http://localhost:3003/inventories/inventories";

const fetchInventoriesFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IInventory[]> => {
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
                    key: "Inventorys",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("Inventorys")
        );
        const data: IInventory[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const fetchItemsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IItemInventory[]> => {
    try {
        const response = await fetch(API_URL + "/items", {
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
                    key: "fetchItems",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("fetchItems")
        );
        const data: IItemInventory[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const fetchInventoriesDetailsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IInventoryDetails[]> => {
    try {
        const response = await fetch(`${API_URL}/details`, {
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
                    key: "Inventorys",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("Inventorys")
        );
        const data: IInventoryDetails[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createInventoryInDB = async (
    data: IPartialInventory,
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
                    key: "createInventory",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createInventory")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const createInventoryInBatchDB = async (
    data: IPartialInventory[],
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(API_URL + "/batch", {
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
                    key: "createInventoryInBatch",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createInventoryInBatch")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateInventoryInDB = async (
    id: number,
    data: IPartialInventory,
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
                    key: "updateInventory",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateInventory")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteInventoryInDB = async (
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
                    key: "deleteInventory",
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
            clearError("deleteInventory")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

export {
    fetchInventoriesFromDB,
    fetchInventoriesDetailsFromDB,
    createInventoryInDB,
    updateInventoryInDB,
    deleteInventoryInDB,
    fetchItemsFromDB,
    createInventoryInBatchDB,
};
