import type { IPartialProductionLine, IProductionLine } from "../../../interfaces/productionLines";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import type { IApiError } from "../../../interfaces/errorApi";


const BASE_URL = import.meta.env.VITE_API_URL;
const relativePath = "production/production-lines/";
const API_URL = new URL(relativePath, BASE_URL);

interface IFetchProductionLinesFromDB {
    dispatch: AppDispatchRedux;
    like?: string;
    conditionsExclude?: IPartialProductionLine;
    signal: AbortSignal;
}

const fetchproductionLinesFromDB = async ({ dispatch, like, conditionsExclude, signal }: IFetchProductionLinesFromDB): Promise<IProductionLine[]> => {
    try {
        // Creamos el objeto params
        const params = new URLSearchParams();
        if (like) params.set("filter", like);

        // Agregamos los params de exclusion si se cumplen ciertas condiciones
        if (conditionsExclude && Object.keys(conditionsExclude).length > 0) {
            Object.entries(conditionsExclude).forEach(([key, value]) => {
                if (Array.isArray(value) || typeof value === "object") {
                    params.set(key, JSON.stringify(value));
                } else {
                    params.set(key, value.toString());
                }
            });
        };

        // Creamos el request
        const request = new Request(`${API_URL}?${params.toString()}`, {
            method: "GET",
            signal
        });

        // Realizamos la peticion a la DB
        const response = await fetch(request);

        // Validamos la respuesta
        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(`${errorText}`);
            }
            dispatch(setError({ key: "productionLines", message: errorText }));
            return [];
        }
        dispatch(clearError("productionLines"));

        // Parseamos la respuesta
        const data: IProductionLine[] = await response.json();

        // Retornamos la data
        return data;
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("abort query production lines");
            return [];
        }
        throw error;
    }
};

interface IFetchProductionLineById {
    id: number | undefined,
    dispatch: AppDispatchRedux,
    signal: AbortSignal
}

const fetchProductionLineById = async ({
    id,
    dispatch,
    signal
}: IFetchProductionLineById): Promise<IProductionLine | null> => {
    try {
        const response = await fetch(`${API_URL}/id/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal
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
                    key: "productionLineById",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("productionLineById")
        );
        const data: IProductionLine =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const fetchProductionLineDetails = async (
    id: number | undefined,
    dispatch: AppDispatchRedux
): Promise<IProductionLine | null> => {
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
                    key: "productionLinesDetails",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("productionLinesDetails")
        );
        const data: IProductionLine =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

// *************** POST *************** //

type ICreateProductionLineDBProps = {
    productionLine: IPartialProductionLine
}

const createCompleteProductionLineInDB = async ({ productionLine }: ICreateProductionLineDBProps): Promise<IPartialProductionLine> => {
    const url = new URL('create-complete', API_URL);
    const request = new Request(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productionLine)
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
    return await response.json();
};

// *************** PATCH *************** //

interface IUpdateCompleteProductionLineInDBProps {
    id: number,
    productionLine: IPartialProductionLine
}

const updateCompleteProductionLineInDB = async ({ id, productionLine }: IUpdateCompleteProductionLineInDBProps): Promise<IPartialProductionLine> => {
    if (!id) throw new Error("No id provided to updateCompleteProductionLineInDB");
    const url = new URL(`update-complete/${encodeURIComponent(id)}`, API_URL);
    console.log('url', url)
    const request = new Request(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productionLine)
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
        console.log("APIERROR ", apiError);
        throw apiError;
    }
    return await response.json();
};

// *************** DELETE *************** //

interface IDeleteProductionLineInDBProps {
    id: number
}

const deleteproductionLineInDB = async ({ id }: IDeleteProductionLineInDBProps): Promise<void> => {
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
    fetchproductionLinesFromDB,
    createCompleteProductionLineInDB,
    deleteproductionLineInDB,
    fetchProductionLineDetails,
    fetchProductionLineById,
    updateCompleteProductionLineInDB

};
