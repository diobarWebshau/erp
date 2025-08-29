import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchClientLike
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

const useClientQueryLikeTo = (like: string) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [clientsLike, setClientsLike] =
        useState<IClient[]>([]);
    const [loadingClientsLike, setLoadingClientsLike] =
        useState<boolean>(true);

    const fetchClientsLike = async () => {
        setLoadingClientsLike(true);
        dispatch(
            clearError("clientsLike")
        );
        try {
            if (like) {
                const data =
                    await fetchClientLike(
                        like,
                        dispatch
                    );
                setClientsLike(data);
            } else {
                setClientsLike([]);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "clientsLike",
                    message: msg
                }));
        } finally {
            setLoadingClientsLike(false);
        }
    };

    useEffect(() => {
        fetchClientsLike();
    }, [like]);

    return {
        clientsLike,
        loadingClientsLike,
        refetchClientsLike:
            fetchClientsLike,
    };
};

export default useClientQueryLikeTo;
