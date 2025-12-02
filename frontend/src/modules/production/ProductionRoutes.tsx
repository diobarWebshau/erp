import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));
const ProductionOrders = lazy(() => import("./models/production-orders/ProductionOrdersModel.tsx"));

const ProductionRoutes: RouteObject[] = [
    {
        path: "productions",
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loading />}>
                        <ProductionOrders />
                    </Suspense>
                )
            }
        ]
    }
];


export default ProductionRoutes;
