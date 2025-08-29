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

const ShippingOrders =
    lazy(() =>
        import("./models/shipping-orders/ShippingOrdersModel.tsx"));

const PrivateRoute =
    lazy(() =>
        import("../../components/load/privateRoute/PrivateRoute.tsx"));

const MainLayout =
    lazy(() =>
        import("../../layouts/main/MainLayout.tsx"));

const LogisticRoutes: RouteObject[] = [
    {
        path: "/logistics",
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
                        <ShippingOrders />
                    </Suspense>
                )
            }
        ]
    }
];

export default LogisticRoutes;
