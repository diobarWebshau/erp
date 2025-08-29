import type {
    ILocation,
    IPartialLocation,
} from "../interfaces/locations";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/locations/location-types";

const fetchLocationTypesFromDB = async (
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
                    key: "LocationTypes",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("LocationTypes")
        );
        const data: ILocation[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const createLocationTypeInDB = async (
    data: IPartialLocation,
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
            dispatch(
                setError({
                    key: "createLocationType",
                    message: errorText
                })
            );
            throw new Error(
                `${errorText}`
            );
        }
        dispatch(
            clearError("createLocationType")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateLocationTypeInDB = async (
    id: number,
    data: IPartialLocation,
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
                    key: "updateLocationType",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateLocationType")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteLocationTypeInDB = async (
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
                    key: "deleteLocationType",
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
            clearError("deleteLocationType")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

export {
    fetchLocationTypesFromDB,
    createLocationTypeInDB,
    updateLocationTypeInDB,
    deleteLocationTypeInDB,
};
