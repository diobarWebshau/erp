import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchClientById
} from "./../queries/clientsQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IClient
} from "../../../interfaces/clients";

const useClientById = (id: number | undefined | null) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [clientById, setClientById] =
        useState<IClient | null>(null);
    const [loadingClientById, setLoadingClientById] =
        useState<boolean>(true);

    const fetchClientByIdFunction = async () => {
        setLoadingClientById(true);
        dispatch(
            clearError("clientByIdHook")
        );
        try {
            if (id) {
                const data =
                    await fetchClientById(
                        id,
                        dispatch
                    );
                setClientById(data);
            } else {
                setClientById(null);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "clientByIdHook",
                    message: msg
                }));
        } finally {
            setLoadingClientById(false);
        }
    };

    useEffect(() => {
        fetchClientByIdFunction();
    }, [id]);

    return {
        clientById,
        loadingClientById,
        refetchClientById:
            fetchClientByIdFunction,
    };
};

export default useClientById;
