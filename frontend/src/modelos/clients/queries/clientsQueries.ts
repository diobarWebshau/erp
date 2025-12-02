import type { IPartialClient, IClient } from "../../../interfaces/clients";
import { setError, clearError } from "../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../store/store";
import type { IApiError } from "../../../interfaces/errorApi";

const BASE_URL = import.meta.env.VITE_API_URL;
const relative_path = "clients/clients/";
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

const validateCompanyName = async (
    companyName: string,
    dispatch: AppDispatchRedux
): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/company_name/${companyName}`, {
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
            return false;
        }
        dispatch(
            clearError("Clients")
        );
        const data: boolean = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}


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


// *************** POST *************** //

type ICreateClientDBProps = {
    client: IPartialClient
}

const createCompleteClientInDB = async ({ client }: ICreateClientDBProps): Promise<IPartialClient> => {
    const url = new URL('create-complete', API_URL);
    const request = new Request(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client)
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
    client: IPartialClient
}

const updateCompleteClientInDB = async ({ id, client }: IUpdateCompleteProductInDBProps): Promise<IPartialClient> => {
    if (!id) throw new Error("No id provided to updateCompleteClientInDB");
    const url = new URL(`update-complete/${encodeURIComponent(id)}`, API_URL);
    const request = new Request(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client)
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

// *************** DELETE *************** //

interface IDeleteClientInDBProps {
    id: number
}

const deleteClientInDB = async ({ id }: IDeleteClientInDBProps): Promise<void> => {
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
    fetchClientsFromDB,
    deleteClientInDB,
    fetchClientWithAddresses,
    updateCompleteClientInDB,
    createCompleteClientInDB,
    fetchClientLike,
    fetchClientById2,
    fetchClientById,
    validateCompanyName,
};
