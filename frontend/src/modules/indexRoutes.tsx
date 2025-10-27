import AuthRoutes
    from "./auth/routes.tsx";
import InventoriesRoutes
    from "./inventories/InventoriesRoutes.tsx";
import LogisticRoutes
    from "./logistic/LogisticRoutes.tsx";
import LocationsRoutes
    from "./locations/LocationRoutes.tsx";
import ClientsRoutes
    from "./clients/ClientRoutes.tsx";
import ProductsRoutes
    from "./products/ProductRoutes.tsx";
import PurchasedOrdersRoutes
    from "./purchased-orders/PurchasedOrderRoutes.tsx";
import ClientRoutes
    from "./clients/ClientRoutes.tsx";
import ProductionRoutes
    from "./production/ProductionRoutes.tsx";
import ProductionLineRoutes
    from "./production_lines/ProductionLineRoutes.tsx";

const mainRoutes = [
    ...AuthRoutes,
    ...InventoriesRoutes,
    ...LogisticRoutes,
    ...LocationsRoutes,
    ...ClientsRoutes,
    ...ProductsRoutes,
    ...PurchasedOrdersRoutes,
    ...ProductionRoutes,
    ...ClientRoutes,
    ...ProductionLineRoutes
]
    
export default mainRoutes;
