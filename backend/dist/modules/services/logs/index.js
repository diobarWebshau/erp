import createOperationRouter from "./routers/Operation.router.js";
import createLogsRouter from "./routers/Logs.router.js";
import createTablesRouter from "./routers/Tables.router.js";
const Logs = {
    createLogsRouter,
    createOperationRouter,
    createTablesRouter
};
export default Logs;
