import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchInputWithTypeByIdFromDB
} from "../../../../../queries/inputsQueries";
import type {
    AppDispatchRedux
} from "../../../../../store/store";
import {
    setError,
    clearError
} from "../../../../../store/slicer/errorSlicer";
import type {
    IInput
} from "../../../../../interfaces/inputs";

const useInputWithTypes = (id: number | undefined) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [InputWithTypes, setInputWithTypes] =
        useState<IInput | null>(null);
    const [loadingInputWithTypes, setLoadingInputWithTypes] =
        useState<boolean>(true);

    const fetchInputWithTypesById = async () => {
        setLoadingInputWithTypes(true);
        dispatch(
            clearError("InputWithTypes")
        );
        try {
            if (id) {
                const data =
                    await fetchInputWithTypeByIdFromDB(
                        id,
                        dispatch
                    );
                setInputWithTypes(data);
            } else {
                setInputWithTypes(null);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "useInputWithTypes",
                    message: msg
                }));
        } finally {
            setLoadingInputWithTypes(false);
        }
    };

    useEffect(() => {
        fetchInputWithTypesById();
    }, [id]);

    return {
        InputWithTypes,
        loadingInputWithTypes,
        refetchInputWithTypesById:
            fetchInputWithTypesById,
    };
};

export default useInputWithTypes;
