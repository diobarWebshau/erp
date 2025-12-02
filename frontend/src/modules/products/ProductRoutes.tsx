import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));
const ProductModel = lazy(() => import("./models/ItemModel.tsx"));

const ProductRoutes: RouteObject[] = [
    {
        path: "products",
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loading />}>
                        <ProductModel />
                    </Suspense>
                )
            }
        ]
    }
];


export default ProductRoutes;
