// shippingOrderProvider.tsx
import type { ReactNode, Dispatch } from "react";
import type { AppDispatchRedux } from "store/store";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { ShippingOrderStateContext, ShippingOrderDispatchContext, ShippingOrderCommandsContext } from "./shippingOrderContext";
import ShippingOrderReducer from "./shippingOrderReducer";
import { initialShippingOrderState } from "./shippingOrderTypes";
import type { ShippingOrderState, ShippingOrderAction } from "./shippingOrderTypes";
import { set_from_server, set_shipping_order } from "./shippingOrderActions";
import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";
import useShippingOrderDetailById from "../../../../../modelos/shipping_orders/hooks/useShippingOrderDetailById";
import { generateRandomIds } from "../../../../../helpers/nanoId";
import type { IPurchasedOrderProduct } from "../../../../../interfaces/purchasedOrdersProducts";
import type { IPurchasedOrder } from "interfaces/purchasedOrder";
import { getPurchasedOrderByIdsInDB } from "../../../../../modelos/purchased_orders/queries/purchaseOrderQueries";
import { useDispatch } from "react-redux";

interface IProviderShippingOrder {
    orderId?: number | null;
    initialData?: IPartialShippingOrder;
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
}

const init = (arg: {
    currentStep: number;
    totalSteps: number;
    baseData?: IPartialShippingOrder;
}): ShippingOrderState => ({
    ...initialShippingOrderState,
    current_step: arg.currentStep,
    total_steps: arg.totalSteps,
    data: { ...initialShippingOrderState.data, ...(arg.baseData ?? {}) },
    draft: { ...initialShippingOrderState.draft, ...(arg.baseData ?? {}) },
});

const ShippingOrderProvider = ({
    orderId = null,
    initialData,
    currentStep,
    totalSteps,
    children,
}: IProviderShippingOrder) => {

    // Si no hay orderId, el hook no hará fetch real
    const { shippingOrderDetailById, refetchShippingOrderDetailById } =
        useShippingOrderDetailById(orderId ?? null);
    const dispatchRedux: AppDispatchRedux = useDispatch();

    // Seed inicial: prioriza initialData — solo en el montaje (lazy init)
    const initialArg = useMemo(
        () => ({
            currentStep,
            totalSteps,
            baseData: initialData ?? {},
        }),
        [currentStep, totalSteps, initialData]
    );

    // ── Normaliza/Enriquece los datos del server con POPs y qtys pendientes
    const processShippingOrderDetailById = useCallback(
        async (data: IPartialShippingOrder): Promise<IPartialShippingOrder> => {
            // Recolecta IDs únicos de purchase_orders existentes en los SOPoPs del SO

            // Generamos un map de las purchased orders
            const posMap = new Map<number, IPurchasedOrder>();

            // Obtenemos todas las purchased orders asociadas a la orden de envío
            const purchasedOrders =
                data?.shipping_order_purchase_order_product?.map(
                    (item) => item.purchase_order_products?.purchase_order as IPurchasedOrder
                ) ?? [];

            // Agregamos las purchased orders al map
            for (const po of purchasedOrders) {
                if (po?.id != null) posMap.set(po.id, po);
            }

            // Obtenemos los ids de las purchased orders
            const poIds = [...posMap.keys()];
            if (poIds.length === 0) {
                // No hay POPs para enriquecer
                return {
                    ...data,
                    shipping_order_purchase_order_product_aux: [],
                };
            }

            // Obtenemos las purchase orders con todas sus POPs
            const responsePurchaseOrders = await getPurchasedOrderByIdsInDB(dispatchRedux, poIds);

            // Aplana los POPs de todas las purchase orders en un solo array
            const allPops = responsePurchaseOrders?.map((p) => p.purchase_order_products ?? []).flat() ?? [];

            // Filtra POPs que no pertenecen al SO actual
            const popsFiltered = allPops.filter(
                (pop): pop is IPurchasedOrderProduct =>
                    pop &&
                    !(data?.shipping_order_purchase_order_product?.some(
                        sopop => sopop?.purchase_order_product_id === pop.id
                    ) ?? false)
            );

            // Filtra POPs que no han sido completados en un contexto de envío
            const popsFilteredShippingComplete = popsFiltered?.filter((pop) => pop.shipping_summary?.shipping_qty !== pop.shipping_summary?.order_qty);

            // Generamos las POPS auxiliares
            const sopops = popsFilteredShippingComplete?.map((p) => ({
                id: generateRandomIds(),
                purchase_order_products: p,
                purchase_order_product_id: p.id,
                location: p.purchase_order_product_location_production_line?.production_line?.location_production_line?.location,
                location_id: p.purchase_order_product_location_production_line?.production_line?.location_production_line?.location?.id,
                location_name: p.purchase_order_product_location_production_line?.production_line?.location_production_line?.location?.name,
                qty:
                    (Number(p.shipping_summary?.order_qty) || 0) -
                    (Number(p.shipping_summary?.shipping_qty) || 0),
            }));

            // Retornamos el objeto con los datos enriquecidos
            return {
                ...data,
                shipping_order_purchase_order_product_aux: [
                    ...(data?.shipping_order_purchase_order_product ?? []),
                    ...sopops,
                ],
            };
        },
        [dispatchRedux] // solo depende del dispatch de Redux
    );

    const [state, dispatch]: [ShippingOrderState, Dispatch<ShippingOrderAction>] =
        useReducer(ShippingOrderReducer, initialArg, init);

    // ── Sincroniza SIEMPRE que llegue data fresca del server (EDITAR o refetch)
    useEffect(() => {
        // Sin orderId o sin data, no hay nada que sincronizar
        if (orderId == null || !shippingOrderDetailById) return;

        let cancelled = false;
        (async () => {
            try {
                const enriched = await processShippingOrderDetailById(shippingOrderDetailById);
                if (!cancelled) {
                    // ¡IMPORTANTE! Aquí despachamos datos, no Promise
                    dispatch(set_from_server(enriched));
                }
            } catch (e) {
                // Aquí podrías registrar en Redux si quieres
                // dispatchRedux(setError(...))
                // pero no entorpezco el provider
                console.error('processShippingOrderDetailById failed:', e);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [orderId, shippingOrderDetailById, processShippingOrderDetailById, dispatch]);

    // ── Comandos
    const refetch = useCallback(async () => {
        if (!orderId) return; // no-op en modo AGREGAR
        await refetchShippingOrderDetailById();
        // Al resolver, shippingOrderDetailById cambia y el effect de arriba sincroniza data
    }, [orderId, refetchShippingOrderDetailById]);

    // Reset “ligero”: vuelve a los datos base sin tocar draft (si quieres total, crea acción RESET)
    const reset = useCallback(() => {
        const base = shippingOrderDetailById ?? initialData ?? {};
        dispatch(set_shipping_order(base)); // solo data — síncrono y sin Promise
    }, [shippingOrderDetailById, initialData, dispatch]);

    const commands = useMemo(() => ({ refetch, reset }), [refetch, reset]);

    return (
        <ShippingOrderStateContext.Provider value={state}>
            <ShippingOrderDispatchContext.Provider value={dispatch}>
                <ShippingOrderCommandsContext.Provider value={commands}>
                    {children}
                </ShippingOrderCommandsContext.Provider>
            </ShippingOrderDispatchContext.Provider>
        </ShippingOrderStateContext.Provider>
    );
};

export default ShippingOrderProvider;
