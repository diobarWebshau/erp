import { ItemDispatchContext, ItemStateContext, ItemCommandsContext } from "./itemContext";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import useItemById from "../../../modelos/item/hooks/useItemById";
import type { IPartialItem } from "../../../interfaces/item";
import { initialItemState } from "./itemTypes";
import type { ItemState } from "./itemTypes";
import { set_item } from "./itemActions";
import itemReducer from "./itemReducer";
import type { ReactNode } from "react";

interface IItemProvider {
    id: number | null,
    children: ReactNode,
    initialData?: IPartialItem,
    currentStep: number,
    totalSteps: number,
}

const init = (arg: {
    currentStep: number;
    totalSteps: number;
    baseData?: IPartialItem;
}): ItemState => ({
    ...initialItemState,
    current_step: arg.currentStep,
    total_steps: arg.totalSteps,
    data: { ...initialItemState.data, ...(arg.baseData ?? {}) },
    draft: { ...initialItemState.draft },
});

const ItemProvider = ({
    id,
    children,
    initialData,
    currentStep,
    totalSteps,
}: IItemProvider) => {

    const { itemById, refetchItemById } = useItemById(id);

    const initialArg = useMemo(() => ({
        currentStep,
        totalSteps,
        baseData: initialData ?? {},
    }), [currentStep, totalSteps, initialData]);

    const [state, dispatch] = useReducer(itemReducer, initialArg, init);

    const refetch = useCallback(async () => {
        if (!id) return;
        await refetchItemById();
    }, [id, refetchItemById]);

    const reset = useCallback(() => {
        const base = itemById ?? initialData ?? {};
        dispatch(set_item(base));
    }, [itemById, initialData, dispatch]);

    const commands = useMemo(() => ({ refetch, reset }), [refetch, reset]);

    useEffect(() => {
        if (id === null || !itemById) return;
        let cancelled = false;
        (async () => {
            try {
                if (!cancelled) {
                    dispatch(set_item(itemById));
                }
            } catch{/**/}
        })();

        return () => {
            cancelled = true;
        };
    }, [id, itemById, dispatch]);

    return (
        <ItemDispatchContext.Provider value={dispatch}>
            <ItemStateContext.Provider value={state}>
                <ItemCommandsContext.Provider value={commands}>
                    {children}
                </ItemCommandsContext.Provider>
            </ItemStateContext.Provider>
        </ItemDispatchContext.Provider>
    );

}


export default ItemProvider;

