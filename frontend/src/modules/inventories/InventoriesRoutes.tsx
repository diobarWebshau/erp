import type {
    RouteObject
} from "react-router-dom";
import {
    lazy,
    Suspense
} from "react";

import Loading from "../../components/load/loading/Loading.tsx";

const Inventory =
    lazy(() =>
        import("./models/inventories/InventoriesModel.tsx"));

const PrivateRoute =
    lazy(() =>
        import("../../components/load/privateRoute/PrivateRoute.tsx"));

const MainLayout =
    lazy(() =>
        import("../../layouts/main/MainLayout.tsx"));

const InventoriesRoutes: RouteObject[] = [
    {
        path: "/inventories",
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
                        <Inventory />
                    </Suspense>
                )
            }
        ]
    }
];

export default InventoriesRoutes;
