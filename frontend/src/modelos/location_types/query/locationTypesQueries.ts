import type { ILocationType } from "./../../../interfaces/locationTypes";
import { setError, clearError } from "./../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "./../../../store/store";

const BASE_URL = import.meta.env.VITE_API_URL;
const relative_path = "location_types/location_types";
const API_URL = new URL(relative_path, BASE_URL);


// // * Get all

// interface IFetchLocationTypesFromDB {
//     signal: AbortSignal
// }

// const fetchLocationTypesFromDB = async ({ signal }: IFetchLocationTypesFromDB): Promise<ILocationType[]> => {
//     const response = await fetch(API_URL, { method: "GET", signal });
//     if (!response.ok) {
//         let errorBody: unknown = null;
//         try {
//             errorBody = await response.json();
//         } catch {
//             // si no hay JSON, lo ignoramos
//         }
//         const message =
//             typeof errorBody === "string"
//                 ? errorBody
//                 : (errorBody as any)?.message ?? `Request failed with status ${response.status}`;
//         throw new Error(message);
//     }
//     const data: ILocationType[] = await response.json();
//     return data;
// };


// * Get all

interface IFetchLocationTypesFromDB {
    dispatch: AppDispatchRedux,
    signal: AbortSignal
}

const fetchLocationTypesFromDB = async ({ dispatch, signal }: IFetchLocationTypesFromDB): Promise<ILocationType[]> => {
    try {
        dispatch(clearError("locationTypes"));
        const response = await fetch(API_URL, {
            method: "GET",
            signal
        });
        
        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "locationTypes",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("locationTypes")
        );
        const data: ILocationType[] = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

interface IFetchLocationTypeById {
    id: number,
    dispatch: AppDispatchRedux,
    signal: AbortSignal
}

// * Get by id

const fetchLocationTypeById = async ({
    id,
    dispatch,
    signal
}: IFetchLocationTypeById): Promise<ILocationType | null> => {
    try {
        const response = await fetch(`${API_URL}/id/${id}`, {
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
                    key: "locationTypeById",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("locationTypeById")
        );
        const data: ILocationType = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

// * Create

interface ICreateLocationInDB {
    data: ILocationType,
    dispatch: AppDispatchRedux,
    signal: AbortSignal
}
const createLocationInDB = async ({
    data,
    dispatch,
    signal
}: ICreateLocationInDB): Promise<any> => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
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
                    key: "createLocationType",
                    message: errorText
                })
            );
            return;
        }
        dispatch(
            clearError("createLocationType")
        );
        const responseData: ILocationType = await response.json();
        return responseData;
    } catch (error: unknown) {
        throw error;
    }
}

// * Update

interface IUpdateLocationTypeInDB {
    id: number,
    data: ILocationType,
    dispatch: AppDispatchRedux,
    signal: AbortSignal,
}

const updateLocationTypeInDB = async ({
    id,
    data,
    dispatch
}: IUpdateLocationTypeInDB): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
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
                    key: "updateLocationType",
                    message: errorText
                })
            );
            return;
        }
        dispatch(
            clearError("updateLocationType")
        );
        const responseData: ILocationType = await response.json();
        return responseData;
    } catch (error: unknown) {
        throw error;
    }
}

// * Delete

interface IDeleteLocationTypeInDB {
    id: number,
    dispatch: AppDispatchRedux,
    signal: AbortSignal,
}

const deleteLocationTypeInDB = async ({
    id,
    dispatch
}: IDeleteLocationTypeInDB): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
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
                    key: "deleteLocationType",
                    message: errorText
                })
            );
            return;
        }
        dispatch(
            clearError("deleteLocationType")
        );
        const responseData: ILocationType = await response.json();
        return responseData;
    } catch (error: unknown) {
        throw error;
    }
}



export {
    fetchLocationTypesFromDB,
    fetchLocationTypeById,
    createLocationInDB,
    updateLocationTypeInDB,
    deleteLocationTypeInDB
};
