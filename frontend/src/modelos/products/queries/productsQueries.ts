import type { IApiError } from "../../../interfaces/errorApi";
import type { IProduct, IPartialProduct } from "../../../interfaces/product";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "production/products/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

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

const fetchProductLike = async (
    like: string,
    dispatch: AppDispatchRedux
): Promise<IProduct[] | []> => {
    try {
        const response = await fetch(`${API_URL}/filter/${like}`, {
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
                    key: "likeToProducts",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("likeToProducts")
        );
        const data: IProduct[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

const getProductsByIdsExclude = async (
    dispatch: AppDispatchRedux,
    excludeIds: number | number[],
    signal?: AbortSignal
): Promise<IProduct[] | []> => {
    try {

        // Generamos los params busqueda para la URL
        const params = new URLSearchParams();

        // Generamos los valores de id
        if (Array.isArray(excludeIds)) {
            excludeIds.forEach((v) => params.append("excludeIds", v.toString()));
        } else {
            params.append("excludeIds", excludeIds.toString());
        }

        /* Generamos la URL */
        const url = new URL(`exclude/`, API_URL.toString()); // respeta tu uso de '/ids'
        url.search = params.toString(); // Esto genera la URL con los params, por ejemplo: /excludeIds?excludeIds=1&excludeIds=2

        // Generamos el request
        const request = new Request(url.toString(), {
            method: "GET",
            signal,
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
                setError({
                    key: "likeWithExludeToProducts",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("likeWithExludeToProducts")
        );
        const data: IProduct[] = await response.json();
        return data;
    } catch (error: unknown) {
        // Ignoramos abortError, solo lanzamos otros errores
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("abort");
            return []; // fetch cancelado, retornamos vacío
        }
        throw error;
    }
}

// *************** POST *************** //

type ICreateProductDBProps = {
    product: IPartialProduct
}

const createCompleteProductInDB = async ({ product }: ICreateProductDBProps): Promise<IPartialProduct> => {
    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
        if (value == null) return;
        // Array de Files
        if (Array.isArray(value) && value.every(v => v instanceof File)) {
            value.forEach((file) => formData.append(key, file));
            return;
        }
        // Array NO de files → JSON
        if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Un solo File
        if (value instanceof File) {
            formData.append(key, value);
            return;
        }
        // Objetos → JSON
        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Primitivos
        formData.append(key, value.toString());
    });
    const url = new URL('create-complete', API_URL);
    const request = new Request(url.toString(), { method: "POST", body: formData });
    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch {/**/ }
        const apiError: IApiError = {
            status: response.status,
            message: errorBody?.message,
            validation: errorBody?.validation,
            code: errorBody?.code,
        };
        throw apiError;
    }
    return await response.json();
};

// *************** PATCH *************** //

const updateCompleteProductInDB = async ({ id, product }: { id: number | undefined, product: IPartialProduct, }): Promise<IPartialProduct> => {
    if (!id) throw new Error("No id provided to updateCompleteProductInDB");
    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
        if (value == null) return;
        // Array de Files
        if (Array.isArray(value) && value.every(v => v instanceof File)) {
            value.forEach((file) => formData.append(key, file));
            return;
        }
        // Array NO de files → JSON
        if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Un solo File
        if (value instanceof File) {
            formData.append(key, value);
            return;
        }
        // Objetos → JSON
        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }
        // Primitivos
        formData.append(key, value.toString());
    });
    const url = new URL(`update-complete/${encodeURIComponent(id)}`, API_URL);
    const request = new Request(url.toString(), { method: "PATCH", body: formData });
    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch {/**/ }
        const apiError: IApiError = {
            status: response.status,
            message: errorBody?.message,
            validation: errorBody?.validation,
            code: errorBody?.code,
        };
        console.log("APIERROR ", apiError);
        throw apiError;
    }
    return await response.json();
};

// *************** DELETE *************** //

const deleteProductInDB = async ({ id }: { id: number }): Promise<void> => {
    const url = new URL(`${encodeURIComponent(id)}`, API_URL);
    const request = new Request(url.toString(), {
        method: "DELETE",
    });
    const response = await fetch(request);

    if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch {/**/ }

        const apiError: IApiError = {
            status: response.status,
            message: errorBody?.message,
            validation: errorBody?.validation,
            code: errorBody?.code,
        };
        throw apiError;
    }
    // 204 → sin body, simplemente resolvemos
    return;
};

export {
    fetchProductsFromDB,
    fetchProductDetails,
    deleteProductInDB,
    createCompleteProductInDB,
    updateCompleteProductInDB,
    fetchProductLike,
    getProductsByIdsExclude
};
