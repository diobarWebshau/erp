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

const InternalOrders =
    lazy(() =>
        import("./models/internal-orders/InternalOrders.model.tsx"))

const ProductionLines =
    lazy(() =>
        import("./models/production-lines/ProductionLinesModel.tsx"))

const ProductionOrders =
    lazy(() =>
        import("./models/production-orders/ProductionOrdersModel.tsx"));

const PrivateRoute =
    lazy(() =>
        import("../../components/load/privateRoute/PrivateRoute.tsx"));

const MainLayout =
    lazy(() =>
        import("../../layouts/main/MainLayout.tsx"));

const ProductionRoutes: RouteObject[] = [
    {
        path: "/productions",
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
                        <ProductionOrders />
                    </Suspense>
                )
            },
            {
                path: "internal-orders",
                element: (
                    <Suspense fallback={<Loading />}>
                        <InternalOrders />
                    </Suspense>
                ),
            },
            {
                path: "production-lines",
                element: (
                    <Suspense fallback={<Loading />}>
                        <ProductionLines />
                    </Suspense>
                ),
            },
        ]
    }
];

export default ProductionRoutes;
