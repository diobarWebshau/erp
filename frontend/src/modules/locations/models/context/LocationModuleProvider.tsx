import type { ReactNode } from "react";
import LocationProvider from "./locationProvider";
import type { IPartialLocation } from "../../../../interfaces/locations";

interface ILocationModuleProvider {
    children: ReactNode;
    data?: IPartialLocation;
    currentStep: number;
    totalSteps: number;
};

const LocationModuleProvider = ({
    children,
    data,
    currentStep,
    totalSteps,
}: ILocationModuleProvider) => {
    return (
        <LocationProvider
            id={data?.id ?? null}
            currentStep={currentStep}
            totalSteps={totalSteps}
            initialData={data}
        >
            {children}
        </LocationProvider>
    );
};

export default LocationModuleProvider;
