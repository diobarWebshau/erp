import type { IPartialItem } from "interfaces/item";
import type { ReactNode } from "react";
import ItemProvider from "./itemProvider";

interface IItemModuleProvider {
    children: ReactNode;
    data?: IPartialItem;
    currentStep: number;
    totalSteps: number;
};

const ItemModuleProvider = ({
    children,
    data,
    currentStep,
    totalSteps,
}: IItemModuleProvider) => {
    return (
        <ItemProvider
            id={data?.id ?? null}
            currentStep={currentStep}
            totalSteps={totalSteps}
            initialData={data}
        >
            {children}
        </ItemProvider>
    );
};

export default ItemModuleProvider;
