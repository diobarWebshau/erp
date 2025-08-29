import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    setError,
    clearError,
} from "../../../../store/slicer/errorSlicer";
import type {
    CartProduct
} from "../../../../interfaces/products-cart";


const API_URL = "http://localhost:3003/products/products/product-discounts-ranges";

const fetchProductsDiscountRangeFromDB = async (
    dispatch: AppDispatchRedux,
    productId: number
): Promise<CartProduct | null> => {
    try {
        const response = await fetch(`${API_URL}/${productId}`, {
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
                    key: "discountRanges",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("discountRanges")
        );
        const data: CartProduct = await response.json();
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
    fetchProductsDiscountRangeFromDB
};
