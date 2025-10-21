import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import ProviderShippingOrder from "./shippingOrderProvider";
import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";
import useShippingOrderDetailById from "../../../../../modelos/shipping_orders/hooks/useShippingOrderDetailById";

interface IShippingOrderModuleProvider {
    children: ReactNode;
    initialStep: number;
    totalSteps: number;
    data?: IPartialShippingOrder;
}

const ShippingOrderModuleProvider = ({
    children,
    initialStep,
    totalSteps,
    data,
}: IShippingOrderModuleProvider) => {
    const { shippingOrderDetailById, refetchShippingOrderDetailById} =
        useShippingOrderDetailById(data?.id ?? null);

    // Evita crear objetos nuevos en cada render
    const providerData = useMemo<IPartialShippingOrder | undefined>(() => {
        return shippingOrderDetailById ?? data ?? undefined;
    }, [shippingOrderDetailById, data]);

    console.log("aaaaaaaaaaaa")

    return (
        <ProviderShippingOrder
            currentStep={initialStep}
            totalSteps={totalSteps}
            data={providerData || {}}
        >
            {children}
        </ProviderShippingOrder>
    );
};

export default ShippingOrderModuleProvider;
