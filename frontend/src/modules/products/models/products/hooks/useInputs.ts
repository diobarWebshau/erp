import { useDispatch }
    from "react-redux";
import type { AppDispatchRedux }
    from "../../../../../store/store";
import { useEffect, useState }
    from "react";
import type { IInput }
    from "../../../../../interfaces/inputs"
import {
    fetchInputsFromDB
} from "../../../../../queries/inputsQueries"
import {
    setError,
    clearError,
} from "../../../../../store/slicer/errorSlicer";

const useInputs = () => {
    const dispatch: AppDispatchRedux =
        useDispatch();
    const [inputs, setInputs] =
        useState<IInput[]>([]);
    const [loadingInputs, setLoadingInputs] =
        useState<boolean>(true);

    const fetchInputs = async () => {
        setLoadingInputs(true);
        dispatch(
            clearError("useInputs")
        );
        try {
            const data =
                await fetchInputsFromDB(
                    dispatch
                );
            setInputs(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "useInputs",
                    message: msg
                }));
        } finally {
            setLoadingInputs(false);
        }
    }

    useEffect(() => {
        fetchInputs();
    }, []);

    return {
        inputs,
        loadingInputs,
        refetchInputs:
            fetchInputs
    };
}

export default useInputs;