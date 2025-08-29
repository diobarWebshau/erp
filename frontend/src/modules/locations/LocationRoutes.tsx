import type {
    RouteObject
} from "react-router-dom";
import {
    lazy,
    Suspense
} from "react";

const Loading =
    lazy(() =>
        import("../../components/load/loading/Loading.tsx"));

const Locations =
    lazy(() =>
        import("./models/locations/LocationsModel.tsx"));

const PrivateRoute =
    lazy(() =>
        import("../../components/load/privateRoute/PrivateRoute.tsx"));

const MainLayout =
    lazy(() =>
        import("../../layouts/main/MainLayout.tsx"));

const LocationsRoutes: RouteObject[] = [
    {
        path: "/locations",
        element: (
            <Suspense fallback={<Loading />}>
                <PrivateRoute>
                    <MainLayout />
                </PrivateRoute>
            </Suspense>
        ),
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
    }
];

export default LocationsRoutes;
