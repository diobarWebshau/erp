import createInventoriesRouter
    from "./routers/Inventories.router.js";
import createInventoriesLocationsItemsRouter
    from "./routers/InventoriesLocationsItems.router.js";
import createScrapRouter
    from "./routers/scrap.router.js";

const Inventories = {
    createInventoriesRouter,
    createInventoriesLocationsItemsRouter,
    createScrapRouter
}

export default Inventories;