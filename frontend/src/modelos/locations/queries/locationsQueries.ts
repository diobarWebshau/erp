import type { IPartialLocation, ILocation } from "../../../interfaces/locations";
import type { IInventoryInput } from "../../../interfaces/inventoryInputs";
import type { IProductionLine } from "../../../interfaces/productionLines";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import type { IApiError } from "interfaces/errorApi";

const BASE_URL = import.meta.env.VITE_API_URL;
const relativePath = "locations/locations/";
const API_URL = new URL(relativePath, BASE_URL);

const fetchLocationsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<ILocation[]> => {
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
                    key: "Locations",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("Locations")
        );
        const data: ILocation[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const getLocationWithAllInformation = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<ILocation | null> => {
    try {
        const response = await fetch(`${API_URL}/with-all-information/${id}`, {
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
                    key: "getLocationWithAllInformation",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("getLocationWithAllInformation")
        );
        const data: ILocation = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}



interface IFetchProductionLinesFromDB {
    dispatch: AppDispatchRedux;
    like?: string;
    conditionsExclude?: IPartialLocation;
    signal: AbortSignal;
}

const getLocationWithAllInformationFromDB = async ({
    dispatch, like, conditionsExclude, signal
}: IFetchProductionLinesFromDB): Promise<ILocation[]> => {
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
        const request = new Request(`${API_URL}/filter?${params.toString()}`, {
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
            dispatch(setError({ key: "locations", message: errorText }));
            return [];
        }
        dispatch(clearError("locations"));

        // Parseamos la respuesta
        const data: ILocation[] = await response.json();

        // Retornamos la data
        return data;
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("abort query locations");
            return [];
        }
        throw error;
    }
};



const fetchLocationsWithTypesFromDB = async (
    dispatch: AppDispatchRedux
): Promise<ILocation[]> => {
    try {
        const response = await fetch(`${API_URL}/with-types`, {
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
                    key: "Locations",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("Locations")
        );
        const data: ILocation[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const getTypesOfLocationFromDB = async (
    id: number | undefined,
    dispatch: AppDispatchRedux
): Promise<ILocation | null> => {
    try {
        const response = await fetch(`${API_URL}/types/${id}`, {
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
                    key: "typesOfLocations",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("typesOfLocations")
        );
        const data: ILocation = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const getLocationsProducedOneProduct = async (
    product_id: number,
    dispatch: AppDispatchRedux
): Promise<ILocation[]> => {
    try {
        const response = await fetch(`${API_URL}/produced/${product_id}`, {
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
                    key: "locationsProducedProduct",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("locationsProducedProduct")
        );
        const data: ILocation[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const getProductionLinesForProductAtLocation = async (
    product_id: number | undefined | null,
    location_id: number | undefined | null,
    dispatch: AppDispatchRedux
): Promise<IProductionLine[]> => {
    try {
        const response = await fetch(`${API_URL}/production-lines/${location_id}/${product_id}`, {
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
                    key: "getProductionLinesForProductAtLocation",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("getProductionLinesForProductAtLocation")
        );
        const data: IProductionLine[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}


const getInventoryInputsOfProductInOneLocation = async (
    product_id: number | undefined | null,
    location_id: number | undefined | null,
    dispatch: AppDispatchRedux
): Promise<IInventoryInput[]> => {
    try {
        const response = await fetch(`${API_URL}/inventory-inputs/${product_id}/${location_id}`, {
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
                    key: "inventoryInputsProduct",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("inventoryInputsProduct")
        );
        const data: IInventoryInput[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

// *************** POST *************** //

type ICreateLocationDBProps = {
    location: IPartialLocation
}

const createCompleteLocationInDB = async ({ location }: ICreateLocationDBProps): Promise<IPartialLocation> => {
    const url = new URL('create-complete', API_URL);
    const request = new Request(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location)
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

interface IUpdateCompleteProductInDBProps {
    id: number,
    location: IPartialLocation
}

const updateCompleteLocationInDB = async ({ id, location }: IUpdateCompleteProductInDBProps): Promise<IPartialLocation> => {
    if (!id) throw new Error("No id provided to updateCompleteLocationInDB");
    const url = new URL(`update-complete/${encodeURIComponent(id)}`, API_URL);
    console.log('url', url)
    const request = new Request(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location)
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

interface IDeleteLocationInDBProps {
    id: number
}

const deleteLocationInDB = async ({ id }: IDeleteLocationInDBProps): Promise<void> => {
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
    fetchLocationsFromDB,
    updateCompleteLocationInDB,
    deleteLocationInDB,
    createCompleteLocationInDB,
    getTypesOfLocationFromDB,
    fetchLocationsWithTypesFromDB,
    getLocationsProducedOneProduct,
    getInventoryInputsOfProductInOneLocation,
    getProductionLinesForProductAtLocation,
    getLocationWithAllInformation,
    getLocationWithAllInformationFromDB
};
