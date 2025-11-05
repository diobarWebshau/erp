import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));
const Client = lazy(() => import("./models/ClientsModel.tsx"));
const PrivateRoute = lazy(() => import("../../components/load/privateRoute/PrivateRoute.tsx"));
const MainLayout = lazy(() => import("../../layouts/main/MainLayout.tsx"));

const ClientRoutes: RouteObject[] = [
    {
        path: "/clients",
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
                        <Client />
                    </Suspense>
                )
            }
        ]
    }
];

export default ClientRoutes;
