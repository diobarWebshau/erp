import type { ReactNode } from "react";
import ClientProvider from "./clientProvider";
import type { IPartialClient } from "../../../interfaces/clients";

interface IClientModuleProvider {
    children: ReactNode;
    data?: IPartialClient;
    currentStep: number;
    totalSteps: number;
}

const ClientModuleProvider = ({
    children,
    data,
    currentStep,
    totalSteps,
}: IClientModuleProvider) => {
    return (
        <ClientProvider
            id={data?.id ?? null}
            currentStep={currentStep}
            totalSteps={totalSteps}
            initialData={data}
        >
            {children}
        </ClientProvider>
    );
};

export default ClientModuleProvider;
