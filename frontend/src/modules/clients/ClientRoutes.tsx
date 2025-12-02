import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Loading = lazy(() => import("../../components/load/loading/Loading.tsx"));
const Client = lazy(() => import("./models/ClientsModel.tsx"));

const ClientRoutes: RouteObject[] = [{
    path: "clients",
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
}];

export default ClientRoutes;
