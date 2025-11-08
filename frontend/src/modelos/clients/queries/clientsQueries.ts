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

const BASE_URL = import.meta.env.VITE_API_URL;
const relative_path = "clients/clients";
const API_URL = new URL(relative_path, BASE_URL);

interface IFetchClientsFromDB {
    dispatch: AppDispatchRedux;
    like?: string;
    conditionsExclude?: IPartialClient;
    signal: AbortSignal;
}

const fetchClientsFromDB = async ({
    dispatch,
    like,
    conditionsExclude,
    signal
}: IFetchClientsFromDB): Promise<IClient[]> => {
    try {

        const params = new URLSearchParams();
        if (like) params.set("filter", like);

        if (conditionsExclude && Object.keys(conditionsExclude).length > 0) {
            Object.entries(conditionsExclude).forEach(([key, value]) => {
                if (Array.isArray(value) || typeof value === "object") {
                    params.set(key, JSON.stringify(value));
                } else {
                    params.set(key, value.toString());
                }
            });
        };

        const request = new Request(`${API_URL}?${params.toString()}`, {
            method: "GET",
            signal
        });

        const response = await fetch(request);

        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(setError({ key: "Clients", message: errorText }));
            return [];
        }
        dispatch(clearError("Clients"));
        const data: IClient[] = await response.json();
        return data;
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("abort query clients");
            return [];
        }
        throw error;
    }
};


const fetchClientById = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<IClient | null> => {
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
                    key: "ClientById",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("ClientById")
        );
        const data: IClient = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}

interface IFetchClientById {
    id: number | undefined,
    dispatch: AppDispatchRedux,
    signal: AbortSignal
}

const fetchClientById2 = async ({
    id,
    dispatch,
    signal
}: IFetchClientById): Promise<IClient | null> => {
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
                    key: "clientById",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("clientById")
        );
        const data: IClient =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const fetchClientLike = async (
    like: string,
    dispatch: AppDispatchRedux,
): Promise<IClient[] | []> => {
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
                    key: "Clients",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("Clients")
        );
        const data: IClient[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}


const fetchClientWithAddresses = async (
    id: number | undefined,
    dispatch: AppDispatchRedux
): Promise<IClient | null> => {
    try {
        const response = await fetch(`${API_URL}/addresses/${id}`, {
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
                    key: "clientWithAddresses",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("clientWithAddresses")
        );
        const data: IClient =
            await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};

const createClientInDB = async (
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
                    key: "createClient",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createClient")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const createCompleteClientInDB = async (
    data: IPartialClient,
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
                    key: "createCompleteClient",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createCompleteClient")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const updateCompleteClientInDB = async (
    id: number,
    data: IPartialClient,
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


const updateClientInDB = async (
    id: number,
    data: IPartialClient,
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
                    key: "updateClient",
                    message: errorText
                })
            );
            return null;
        }

        dispatch(
            clearError("updateClient")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};

const deleteClientInDB = async (
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
                    key: "deleteClient",
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
            clearError("deleteClient")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchClientsFromDB,
    createClientInDB,
    updateClientInDB,
    deleteClientInDB,
    fetchClientWithAddresses,
    updateCompleteClientInDB,
    createCompleteClientInDB,
    fetchClientLike,
    fetchClientById2,
    fetchClientById
};
