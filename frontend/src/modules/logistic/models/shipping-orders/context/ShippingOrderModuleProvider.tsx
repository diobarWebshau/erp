import type { ReactNode } from "react";
import ProviderShippingOrder from "./shippingOrderProvider";
import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";

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
    data
}: IShippingOrderModuleProvider) => {
    return (
        <ProviderShippingOrder
            currentStep={initialStep}
            totalSteps={totalSteps}
            data={data}
        >
            {children}
        </ProviderShippingOrder>
    )
}

export default ShippingOrderModuleProvider;
