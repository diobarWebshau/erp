import type {
    IClientAddress
} from "../../structure/types";
import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    setError,
    clearError,
} from "../../../../store/slicer/errorSlicer";

const fetchClientAddressesFromDB = async (
    clientId: number,
    dispatch: AppDispatchRedux
): Promise<IClientAddress[]> => {
    const API_URL = `http://localhost:3003/production/clients/addresses/${clientId}`;

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
                    key: "clientAddresses",
                    message: errorText
                })
            );
            return [];
        }

        dispatch(clearError("clientAddresses"));
        const data: IClientAddress[] = await response.json();
        return data;
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? { validation: error.message }
                : { validation: "Unknown error" };
        dispatch(
            setError({
                key: "clientAddresses",
                message
            })
        );
        throw error;
    }
};

export {
    fetchClientAddressesFromDB
};
