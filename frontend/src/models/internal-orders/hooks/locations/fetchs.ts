import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    setError,
    clearError,
} from "../../../../store/slicer/errorSlicer";
import type { ILocation } from "../../../../interfaces/locations";

const API_URL = "http://localhost:3003/locations/locations";

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
                    `HTTP error! Status: ${response.status} `
                    + `- ${response.statusText} `
                    + `- Message: ${errorText}`
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
        const message =
            error instanceof Error
                ? { validation: error.message }
                : { validation: "Unknown error" };
        dispatch(
            setError({
                key: "Locations",
                message
            })
        );
        throw error;
    }
};

export {
    fetchLocationsFromDB
};
