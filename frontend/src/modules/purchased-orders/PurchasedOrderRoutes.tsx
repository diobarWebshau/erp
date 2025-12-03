import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const PurchasedOrders = lazy(() => import("./models/PurchasedOrdersModel.tsx"));
const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));

const PurchasedOrdersRoutes: RouteObject[] = [
    {
        path: "purchased-orders",
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
