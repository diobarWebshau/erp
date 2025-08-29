import type {
    IPartialLocation,
    ILocation
} from "../interfaces/locations";
import type {
    ILocationType
} from "../interfaces/locationTypes";
import {
    setError,
    clearError,
} from "../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../store/store";

const API_URL =
    "http://localhost:3003/locations/locations";

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


const createLocationInDB = async (
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
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "createLocation",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createLocation")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const createCompleteLocationInDB = async (
    data: IPartialLocation,
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
                    key: "createCompleteLocation",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createCompleteLocation")
        );
        const result =
            await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateLocationInDB = async (
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
                    key: "updateLocation",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateLocation")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const updateCompleteLocationInDB = async (
    id: number,
    data: {
        update_fields: IPartialLocation,
        update_types: {
            added: ILocationType[],
            modified: ILocationType[],
            deleted: ILocationType[]
        }
    },
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/update-complete/${id}`, {
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
                    key: "updateCompleteLocation",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateCompleteLocation")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteLocationInDB = async (
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
                    key: "deleteLocation",
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
            clearError("deleteLocation")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchLocationsFromDB,
    createLocationInDB,
    updateLocationInDB,
    deleteLocationInDB,
    createCompleteLocationInDB,
    getTypesOfLocationFromDB,
    updateCompleteLocationInDB,
    fetchLocationsWithTypesFromDB
};
