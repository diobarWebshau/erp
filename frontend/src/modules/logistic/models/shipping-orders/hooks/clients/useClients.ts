import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchClientsFromDB
} from "./../../../../../../queries/clientsQueries";
import type {
    IClient
} from "../../../../../../interfaces/clients";
import type {
    AppDispatchRedux
} from "../../../../../../store/store";
import {
    setError, clearError
} from "../../../../../../store/slicer/errorSlicer";

const useClients = () => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [clients, setClients] =
        useState<IClient[]>([]);
    const [loadingClients, setLoadingClients] =
        useState<boolean>(true);

    const fetchClients = async () => {
        setLoadingClients(true);
        dispatch(clearError("clients"));
        try {
            const data =
                await fetchClientsFromDB(dispatch);
            setClients(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({
                key: "clients",
                message: msg
            }));
        } finally {
            setLoadingClients(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return {
        clients,
        loadingClients,
        refetchClients: fetchClients,
    };
};

export default useClients;
