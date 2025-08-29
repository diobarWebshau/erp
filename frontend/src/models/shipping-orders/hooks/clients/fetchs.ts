import type {
    IClient,
} from "./../../../../interfaces/clients";
import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    setError,
    clearError,
} from "../../../../store/slicer/errorSlicer";

const API_URL = "http://localhost:3003/clients/clients";

const fetchClientsFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IClient[]> => {
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
                    key: "clients",
                    message: errorText
                })
            );
            return [];
        }

        dispatch(
            clearError("clients")
        );
        const data: IClient[] = await response.json();
        return data;
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? { validation: error.message }
                : { validation: "Unknown error" };
        dispatch(
            setError({
                key: "clients",
                message
            })
        );
        throw error;
    }
};

export {
    fetchClientsFromDB
};
