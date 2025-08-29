import { useDispatch }
    from "react-redux";
import type { AppDispatchRedux }
    from "../../../store/store";
import { useEffect, useState }
    from "react";
import type { IProcess }
    from "../../../interfaces/processes"
import {
    fetchProccessesFromDB
} from "../../../queries/proccessesQueries"
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";

const useProcesses = () => {
    const dispatch: AppDispatchRedux =
        useDispatch();
    const [processes, setProcesses] =
        useState<IProcess[]>([]);
    const [loadingProcesses, setLoadingProcesses] =
        useState<boolean>(true);

    const fetchProcesses = async () => {
        setLoadingProcesses(true);
        dispatch(
            clearError("useProcesses")
        );
        try {
            const data =
                await fetchProccessesFromDB(
                    dispatch
                );
            setProcesses(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "useProcesses",
                    message: msg
                }));
        } finally {
            setLoadingProcesses(false);
        }
    }

    useEffect(() => {
        fetchProcesses();
    }, []);

    return {
        processes,
        loadingProcesses,
        refetchProcesses:
            fetchProcesses
    };
}

export default useProcesses;