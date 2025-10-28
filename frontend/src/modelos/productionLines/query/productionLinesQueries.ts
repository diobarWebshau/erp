import type { IPartialProductionLine, IProductionLine } from "../../../interfaces/productionLines";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";

const API_URL = "http://localhost:3003/production/production-lines";

interface IFetchProductionLinesFromDB {
    dispatch: AppDispatchRedux;
    like?: string;
    conditionsExclude?: IPartialProductionLine;
    signal: AbortSignal;
}

const fetchproductionLinesFromDB = async ({
    dispatch, like, conditionsExclude, signal
}: IFetchProductionLinesFromDB): Promise<IProductionLine[]> => {
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


const createproductionLineInDB = async (
    data: IPartialProductionLine,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/create-complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "createProductionLine",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createProductionLine")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const createCompleteproductionLineInDB = async (
    data: IPartialProductionLine,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/create-complete`, {
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
                    key: "createCompleteProductionLine",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createCompleteProductionLine")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const updateCompleteproductionLineInDB = async (
    id: number,
    data: IPartialProductionLine,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/update-complete/${id}`, {
            method: "PATCH",
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
                    key: "updateCompleteProductionLine",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("updateCompleteProductionLine")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateproductionLineInDB = async (
    id: number,
    data: IPartialProductionLine,
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
                    key: "updateProductionLine",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateProductionLine")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const deleteproductionLineInDB = async (
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
                    key: "deleteproductionLine",
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
            clearError("deleteproductionLine")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchproductionLinesFromDB,
    createproductionLineInDB,
    updateproductionLineInDB,
    deleteproductionLineInDB,
    createCompleteproductionLineInDB,
    fetchProductionLineDetails,
    fetchProductionLineById,
    updateCompleteproductionLineInDB

};
