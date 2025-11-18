import type { IItem } from "interfaces/item";
import type { AppDispatchRedux } from "../../../store/store";
import { setError, clearError } from "../../../store/slicer/errorSlicer";

const BASE_URL = import.meta.env.VITE_API_URL;
const relativePath = "production/items";
const API_URL = new URL(relativePath, BASE_URL);

interface IFetchItemsFromDB {
    dispatch: AppDispatchRedux;
    signal: AbortSignal;
}

const fetchItemsFromDB = async ({
    dispatch,
    signal
}: IFetchItemsFromDB): Promise<IItem[]> => {
    try {
        const request = new Request(`${API_URL}`, {
            method: "GET",
            signal
        });

        const response = await fetch(request);

        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(
                setError({ key: "Items", message: errorText })
            );
            return [];
        }
        dispatch(
            clearError("Items")
        );
        const data: IItem[] = await response.json();
        return data;
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return [];
        }
        throw error;
    }
}


export {
    fetchItemsFromDB
};