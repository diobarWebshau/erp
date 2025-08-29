import type {
    IClientAddress,
    IPartialClientAddress
} from "../../../interfaces/clientAddress";
import type {
    IPartialClient, IClient
} from "../../../interfaces/clients";
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../store/store";

const API_URL =
    "http://localhost:3003/clients/client-addresses/";

const fetchClientAddressesFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IClientAddress[]> => {
    try {
        const response = await fetch(API_URL, {
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
                    key: "ClientAddresses",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("ClientAddresses")
        );
        const data: IClientAddress[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const fetchClientAddressById = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<IClientAddress[]> => {
    try {
        const response = await fetch(`${API_URL}/client/${id}`, {
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
                    key: "ClientAddressesById",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("ClientAddressesById")
        );
        const data: IClientAddress[] =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

const fetchClientAddressLike = async (
    like: string,
    dispatch: AppDispatchRedux
): Promise<IClientAddress[] | []> => {
    try {
        const response = await fetch(`${API_URL}/filter/${like}`, {
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
                    key: "ClientAddressesLike",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("ClientAddressesLike")
        );
        const data: IClientAddress[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

const createClientAddressInDB = async (
    data: IPartialClient,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            console.log(errorText);
            dispatch(
                setError({
                    key: "createClientAddress",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createClientAddress")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateClientAddressInDB = async (
    id: number,
    data: IPartialClientAddress,
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
            console.log(errorText);
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "updateCompleteClient",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("updateCompleteClient")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteClientAddressInDB = async (
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
                    key: "deleteClientAddress",
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
            clearError("deleteClientAddress")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchClientAddressesFromDB,
    createClientAddressInDB,
    updateClientAddressInDB,
    deleteClientAddressInDB,
    fetchClientAddressLike,
    fetchClientAddressById
};
