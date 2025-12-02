import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const ShippingOrders = lazy(() => import("./models/shipping-orders/ShippingOrdersModel.tsx"));
const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));

const LogisticRoutes: RouteObject[] = [{
    path: "logistics", // SIN SLASH
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
}];

export default LogisticRoutes;
