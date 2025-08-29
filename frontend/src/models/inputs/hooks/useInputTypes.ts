import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchInputTypesFromDB
} from "../../../queries/inputTypesQueries";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IInputType
} from "../../../interfaces/inputType";

const useInputTypes = () => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [inputTypes, setInputTypes] =
        useState<IInputType[]>([]);
    const [loadingInputTypes, setLoadingInputTypes] =
        useState<boolean>(true);

    const fetchInputTypes = async () => {
        setLoadingInputTypes(true);
        dispatch(
            clearError("inputTypes")
        );
        try {
            const data =
                await fetchInputTypesFromDB(dispatch);
            setInputTypes(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "useInputTypes",
                    message: msg
                }));
        } finally {
            setLoadingInputTypes(false);
        }
    };

    useEffect(() => {
        fetchInputTypes();
    }, []);

    return {
        inputTypes,
        loadingInputTypes,
        refetchInputTypes:
            fetchInputTypes,
    };
};

export default useInputTypes;
