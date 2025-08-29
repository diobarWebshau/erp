import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchClientWithAddresses
} from "../../../../../queries/clientsQueries";
import type {
    AppDispatchRedux
} from "../../../../../store/store";
import {
    setError,
    clearError
} from "../../../../../store/slicer/errorSlicer";
import type {
    IClient
} from "../../../../../interfaces/clients";

const useClientWithAddresses = (id: number | undefined) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [clientWithAddresses, setClientWithAddresses] =
        useState<IClient | null>(null);
    const [loadingClientWithAddresses, setLoadingClientWithAddresses] =
        useState<boolean>(true);

    const fetchClientWithAddressesById = async () => {
        setLoadingClientWithAddresses(true);
        dispatch(
            clearError("clientWithAddresses")
        );
        try {
            if (id) {
                const data =
                    await fetchClientWithAddresses(
                        id,
                        dispatch
                    );
                setClientWithAddresses(data);
            } else {
                setClientWithAddresses(null);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "useClientWithAddresses",
                    message: msg
                }));
        } finally {
            setLoadingClientWithAddresses(false);
        }
    };

    useEffect(() => {
        fetchClientWithAddressesById();
    }, [id]);

    return {
        clientWithAddresses,
        loadingClientWithAddresses,
        refetchClientWithAddressesById:
            fetchClientWithAddressesById,
    };
};

export default useClientWithAddresses;
