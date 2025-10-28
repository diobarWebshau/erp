import type { ReactNode } from "react";
import ProductionLineProvider from "./productonLineProvider";
import type { IPartialProductionLine } from "../../../interfaces/productionLines";

interface IProductionLineModuleProvider {
    children: ReactNode;
    initialStep: number;
    totalSteps: number;
    data?: IPartialProductionLine;
}

const ProductionLineModuleProvider = ({
    children,
    initialStep,
    totalSteps,
    data,
}: IProductionLineModuleProvider) => {

    return (
        <ProductionLineProvider
            id={data?.id ?? null}
            currentStep={initialStep}
            totalSteps={totalSteps}
            initialData={data}
        >
            {children}
        </ProductionLineProvider>
    );
};

export default ProductionLineModuleProvider;
