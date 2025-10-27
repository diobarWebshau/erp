import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));
const PrivateRoute = lazy(() => import("../../components/load/privateRoute/PrivateRoute.tsx"));
const MainLayout = lazy(() => import("../../layouts/main/MainLayout.tsx"));
const ProductionLineModel = lazy(() => import("./model/ProductionLineModel.tsx"));
const ProductionLineRoutes: RouteObject[] = [
    {
        path: "/production-lines",
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
                        <ProductionLineModel />
                    </Suspense>
                )
            }
        ]
    }
];

export default ProductionLineRoutes;

