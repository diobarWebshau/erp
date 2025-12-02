import Loading from "../../components/load/loading/Loading.tsx";
import type { RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

const Inventory = lazy(() => import("./models/inventories/InventoriesModel.tsx"));

const InventoriesRoutes: RouteObject[] = [{
    path: "inventories",
    children: [
        {
            index: true,
            element: (
                <Suspense fallback={<Loading />}>
                    <Inventory />
                </Suspense>
            )
        }
    ]
}];


export default InventoriesRoutes;
