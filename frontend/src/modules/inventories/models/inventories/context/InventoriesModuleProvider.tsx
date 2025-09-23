import ProviderInventories from "./inventoriesProvider";
import type { ReactNode } from "react";

interface IInventoriesModuleProvider {
    children: ReactNode;
    initialStep: number;
    totalSteps: number;
}

const InventoriesModuleProvider = ({
    children,
    initialStep,
    totalSteps,
}: IInventoriesModuleProvider) => {
    return (
        <ProviderInventories
            currentStep={initialStep}
            totalSteps={totalSteps}
        >
            {children}
        </ProviderInventories>
    )
}

export default InventoriesModuleProvider;


