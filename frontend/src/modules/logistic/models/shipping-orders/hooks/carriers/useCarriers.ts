import {
    useState, useEffect
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchCarriersFromDB
} from "../../../../../../queries/carriersQueries";
import type {
    ICarrier
} from "../../../../../../interfaces/carriers";
import type {
    AppDispatchRedux
} from "../../../../../../store/store";
import {
    setError, clearError
} from "../../../../../../store/slicer/errorSlicer";

const useCarriers = () => {
    const dispatch = useDispatch<AppDispatchRedux>();
    const [carriers, setCarriers] = useState<ICarrier[]>([]);
    const [loadingCarriers, setLoadingCarriers] = useState<boolean>(true);

    const fetchCarriers = async () => {
        setLoadingCarriers(true);
        dispatch(clearError("Carriers"));
        try {
            const data = await fetchCarriersFromDB(dispatch);
            setCarriers(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({ key: "Carriers", message: msg }));
        } finally {
            setLoadingCarriers(false);
        }
    };

    useEffect(() => {
        fetchCarriers();
    }, []);

    return {
        carriers,
        loadingCarriers,
        refetchcarriers: fetchCarriers,
    };
};

export default useCarriers;
