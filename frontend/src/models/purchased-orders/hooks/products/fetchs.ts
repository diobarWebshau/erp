import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    setError,
    clearError,
} from "../../../../store/slicer/errorSlicer";
import type { IProduct } from "../../../../interfaces/product";

const API_URL = "http://localhost:3003/products/products";

const fetchProductsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IProduct[]> => {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(
                    `HTTP error! Status: ${response.status} `
                    + `- ${response.statusText} `
                    + `- Message: ${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "products",
                    message: errorText
                })
            );
            return [];
        }

        dispatch(
            clearError("products")
        );
        const data: IProduct[] = await response.json();
        return data;
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? { validation: error.message }
                : { validation: "Unknown error" };
        dispatch(
            setError({
                key: "products",
                message
            })
        );
        throw error;
    }
};

export {
    fetchProductsFromDB
};
