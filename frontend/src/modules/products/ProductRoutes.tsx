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

const ProductModel =
    lazy(() =>
        import("../../models/products/ProductModel.tsx"));

const PrivateRoute =
    lazy(() =>
        import("../../components/load/privateRoute/PrivateRoute.tsx"));

const MainLayout =
    lazy(() =>
        import("../../layouts/main/MainLayout.tsx"));

const ProductRoutes: RouteObject[] = [
    {
        path: "/products",
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
                        <ProductModel />
                    </Suspense>
                )
            }
        ]
    }
];

export default ProductRoutes;
