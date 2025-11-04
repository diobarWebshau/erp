import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { IPartialProductionLine } from "../../../interfaces/productionLines";
import { initialProductionLineState } from "./productionLineTypes";
import type { ProductionLineState } from "./productionLineTypes";
import {
    ProductionLineDispatchContext, ProductionLineCommandsContext, ProductionLineStateContext
} from "./productionLineContext";
import useProductionLineById from "../../../modelos/productionLines/hooks/useProductionLineById";
import productionLineReducer from "./productionLineReducer";
import { set_production_line } from "./productionLineActions";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../store/store";
import { setError } from "../../../store/slicer/errorSlicer";

interface IProductionLineModuleProvider {
    id: number | null;
    children: ReactNode;
    initialData?: IPartialProductionLine;
    currentStep: number;
    totalSteps: number;
}

const init = (arg: {
    currentStep: number;
    totalSteps: number;
    baseData?: IPartialProductionLine;
}): ProductionLineState => ({
    ...initialProductionLineState,
    current_step: arg.currentStep,
    total_steps: arg.totalSteps,
    data: { ...initialProductionLineState.data, ...(arg.baseData ?? {}) },
    draft: { ...initialProductionLineState.draft},
});


const ProductionLineProvider = ({
    id,
    children,
    initialData,
    currentStep,
    totalSteps,
}: IProductionLineModuleProvider) => {

    const { productionLineById, refetchProductionLineById } =
        useProductionLineById(id ?? null);
    const dispatchRedux: AppDispatchRedux = useDispatch();

    const initialArg = useMemo(
        () => ({
            currentStep,
            totalSteps,
            baseData: initialData ?? {},
        }),
        [currentStep, totalSteps, initialData]
    );

    const [state, dispatch] = useReducer(productionLineReducer, initialArg, init);

    const refetch = useCallback(async () => {
        if (!id) return;
        await refetchProductionLineById();
    }, [id, refetchProductionLineById]);

    const reset = useCallback(() => {
        const base = productionLineById ?? initialData ?? {};
        dispatch(set_production_line(base));
    }, [productionLineById, initialData, dispatch]);

    const commands = useMemo(() => ({ refetch, reset }), [refetch, reset]);

    // ── Sincroniza SIEMPRE que llegue data fresca del server (EDITAR o refetch)
    useEffect(() => {
        // Sin orderId o sin data, no hay nada que sincronizar
        if (id == null || !productionLineById) return;

        let cancelled = false;
        (async () => {
            try {
                if (!cancelled) {
                    // ¡IMPORTANTE! Aquí despachamos datos, no Promise
                    dispatch(set_production_line(productionLineById));
                }
            } catch (e) {
                if (e instanceof Error) {
                    dispatchRedux(setError({
                        key: 'processProductionLineById',
                        message: { validation: e.message }
                    }));
                } else {
                    console.error('processProductionLineById failed:', e);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, productionLineById, dispatch]);

    return (
        <ProductionLineDispatchContext.Provider value={dispatch}>
            <ProductionLineStateContext.Provider value={state}>
                <ProductionLineCommandsContext.Provider value={commands}>
                    {children}
                </ProductionLineCommandsContext.Provider>
            </ProductionLineStateContext.Provider>
        </ProductionLineDispatchContext.Provider>
    );

}

export default ProductionLineProvider;
