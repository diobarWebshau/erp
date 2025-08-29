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

const PurchasedOrders =
    lazy(() =>
        import("./models/purchased-orders/PurchasedOrdersModel.tsx"));

const PrivateRoute =
    lazy(() =>
        import("../../components/load/privateRoute/PrivateRoute.tsx"));

const MainLayout =
    lazy(() =>
        import("../../layouts/main/MainLayout.tsx"));

const PurchasedOrdersRoutes: RouteObject[] = [
    {
        path: "/purchased-orders",
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
                        <PurchasedOrders />
                    </Suspense>
                )
            }
        ]
    }
];

export default PurchasedOrdersRoutes;
