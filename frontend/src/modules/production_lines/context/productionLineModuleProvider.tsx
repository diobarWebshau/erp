import type { IPartialProductionLine } from "../../../interfaces/productionLines";
import ProductionLineProvider from "./productonLineProvider";
import type { ReactNode } from "react";

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
            id={data?.id ? Number(data.id) : null}
            currentStep={initialStep}
            totalSteps={totalSteps}
            initialData={data}
        >
            {children}
        </ProductionLineProvider>
    );
};

export default ProductionLineModuleProvider;
