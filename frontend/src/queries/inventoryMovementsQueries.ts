import type {
    IPartialInventoryMovement,
    IInventoryMovement
} from "../interfaces/inventoyMovements";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/production/inventory-movements";

const fetchInventoryMovementsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IInventoryMovement[]> => {
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
                    key: "InventoryMovements",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("InventoryMovements")
        );
        const data: IInventoryMovement[] =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const createInventoryMovementInDB = async (
    data: IPartialInventoryMovement,
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
                    key: "createInventoryMovement",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createInventoryMovement")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};



const updateInventoryMovementInDB = async (
    id: number,
    data: IPartialInventoryMovement,
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
                    key: "updateInventoryMovement",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateInventoryMovement")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const deleteInventoryMovementInDB = async (
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
                    key: "deleteInventoryMovement",
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
            clearError("deleteInventoryMovement")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchInventoryMovementsFromDB,
    createInventoryMovementInDB,
    updateInventoryMovementInDB,
    deleteInventoryMovementInDB,
};
