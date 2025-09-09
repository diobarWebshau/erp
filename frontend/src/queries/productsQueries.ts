import type {
    IProduct, IPartialProduct
} from "../interfaces/product";
import type { IPartialProductDiscountRange } from "../interfaces/product-discounts-ranges";
import type { IPartialProductInput } from "../interfaces/productsInputs";
import type { IPartialProductProcess } from "../interfaces/productsProcesses";
import {
    setError, clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/production/products";

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
                    `${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "Products",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("Products")
        );
        const data: IProduct[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const fetchProductDetails = async (
    id: number | undefined,
    dispatch: AppDispatchRedux
): Promise<IProduct | null> => {
    try {
        const response = await fetch(`${API_URL}/details/${id}`, {
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
                    key: "Products",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("Products")
        );
        const data: IProduct = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

const createProductInDB = async (
    data: IPartialProduct,
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
            console.log(errorText);
            dispatch(
                setError({
                    key: "createProduct",
                    message: errorText
                })
            );
            throw new Error(
                `${errorText}`
            );
        }
        dispatch(
            clearError("createProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

// const createCompleteProductInDB = async (
//     data: IPartialProduct,
//     dispatch: AppDispatchRedux
// ): Promise<any> => {
//     try {
//         const response = await fetch(`${API_URL}/create-complete`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data),
//         });

//         if (!response.ok) {
//             const errorText = await response.json();
//             console.log(errorText)
//             dispatch(
//                 setError({
//                     key: "createCompleteProduct",
//                     message: errorText
//                 })
//             );
//             throw new Error(
//                 `${errorText}`
//             );
//         }
//         dispatch(
//             clearError("createCompleteProduct")
//         );
//         const result = await response.json();
//         return result;
//     } catch (error: unknown) {
//         throw error;
//     }
// };


const createCompleteProductInDB = async (
    product: IPartialProduct,
    processes: IPartialProductProcess[],
    inputs: IPartialProductInput[],
    discounts: IPartialProductDiscountRange[],
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const formData = new FormData();

        formData.append("name", product.name ?? "");
        formData.append("description", product.description ?? "");
        formData.append("type", product.type ?? "");
        formData.append("sku", product.sku ?? "");
        formData.append("sale_price", String(product.sale_price ?? ""));
        formData.append("active", Number(product.active).toString());
        formData.append("product_processes", JSON.stringify(processes ?? []));
        formData.append("products_inputs", JSON.stringify(inputs ?? []));
        formData.append("product_discount_ranges", JSON.stringify(discounts ?? []));

        if (product.photo instanceof File) {
            formData.append("photo", product.photo);
        }

        console.log(formData);

        // Enviar
        const response = await fetch(`${API_URL}/create-complete`, {
            method: "POST",
            body: formData,
        });

        // Manejo de errores
        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText);
            dispatch(
                setError({
                    key: "createCompleteProduct",
                    message: errorText,
                })
            );
            throw new Error(`${errorText}`);
        }

        dispatch(clearError("createCompleteProduct"));
        return await response.json();
    } catch (error: unknown) {
        throw error;
    }
};

const updateCompleteProductInDB = async (
    id: number,
    data: IPartialProduct,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                // No hacemos append si el valor es null o undefined
                return;
            } else if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === "object") {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_URL}/update-complete/${id}`, {
            method: "PATCH",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.json();
            console.error(errorText);
            if (response.status >= 500)
                throw new Error(
                    errorText
                );
            dispatch(
                setError({
                    key: "updateCompleteProduct",
                    message: errorText,
                })
            );
            throw new Error(`${errorText}`);
        }
        const respuesta = await response.json()
        dispatch(clearError("updateCompleteProduct"));
        return await respuesta;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updateProductInDB = async (
    id: number,
    data: IPartialProduct,
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
                    key: "updateProduct",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteProductInDB = async (
    id: number | undefined,
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
                    key: "deleteProduct",
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
            clearError("deleteProduct")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

export {
    fetchProductsFromDB,
    fetchProductDetails,
    createProductInDB,
    updateProductInDB,
    deleteProductInDB,
    createCompleteProductInDB,
    updateCompleteProductInDB

};
