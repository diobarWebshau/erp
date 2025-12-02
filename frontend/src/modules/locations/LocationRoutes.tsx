import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));
const Locations = lazy(() => import("./models/LocationsModel.tsx"));

const LocationsRoutes: RouteObject[] = [{
    path: "locations", 
    children: [
        {
            index: true,
            element: (
                <Suspense fallback={<Loading />}>
                    <Locations />
                </Suspense>
            )
        }
    ]
}];

export default LocationsRoutes;
