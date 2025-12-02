import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));
const ProductionLineModel = lazy(() => import("./model/ProductionLineModel.tsx"));

const ProductionLineRoutes: RouteObject[] = [{
    path: "production-lines",
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
}];

export default ProductionLineRoutes;

