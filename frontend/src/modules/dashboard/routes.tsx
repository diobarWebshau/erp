// import LocationTypesModel
//     from "../../models/locations-types/LocationTypes.model.tsx";
import PurchasedOrderModel
    from "../../models/purchased-orders/PurchasedOrdersModel.tsx";
import InternalOrderModel
    from "../../models/internal-orders/InternalOrders.model.tsx";
import PrivateRoute
    from "../../components/load/privateRoute/PrivateRoute.tsx";
import ProductionOrderModel
    from "../../models/production-orders/ProductionOrdersModel.tsx";
import ShippingOrderModel
    from "../../models/shipping-orders/ShippingOrdersModel.tsx";
import InventoriesModel
    from "../../models/inventories/InventoriesModel.tsx";
import LocationsModel
    from "../../models/locations/LocationsModel.tsx";
import MainLayout
    from "../../layouts/main/MainLayout.tsx";
import type {
    RouteObject
} from "react-router-dom";
import {
    lazy, Suspense
} from "react";
import ProductsModel
    from "../../models/products/ProductModel2.tsx";
import ProductionLinesModel
    from "../../models/production-lines/ProductionLinesModel.tsx";
import ClientsModel
    from "../../models/clients/ClientsModel.tsx";
import InputsModel from "../../models/inputs/InputsModel.tsx";

const Loading =
    lazy(() =>
        import("../../components/load/loading/Loading.tsx"));
const Home =
    lazy(() =>
        import("../dashboard/pages/Home.tsx"));

const DashboardRoutes: RouteObject[] = [
    {
        path: "/",
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
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <Home />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "purchased-orders",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <PurchasedOrderModel />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "internal-orders",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <InternalOrderModel />
                        </Suspense>
                    </PrivateRoute >
                )
            },
            {
                path: "inventories",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <InventoriesModel />
                        </Suspense>
                    </PrivateRoute >
                )
            },
            {
                path: "production-orders",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <ProductionOrderModel />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "production",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <div>Production</div>
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "production-lines",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <ProductionLinesModel />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "locations",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <LocationsModel />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "shipping-orders",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <ShippingOrderModel />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "inventories",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <div>Inventories</div>
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "products",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <ProductsModel />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "clients",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <ClientsModel />
                        </Suspense>
                    </PrivateRoute>
                )
            },
            {
                path: "inputs",
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<Loading />}>
                            <InputsModel />
                        </Suspense>
                    </PrivateRoute>
                )
            }
        ]
    }
];

export default DashboardRoutes;
