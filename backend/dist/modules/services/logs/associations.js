import OperationModel from "./models/base/Operations.model.js";
import TableModel from "./models/base/Tables.model.js";
import LogModel from "./models/references/Logs.model.js";
/* Logs - Operations
* Una operations puede tener muchos logs
* Un log puede tener solo un operation
*/
OperationModel.hasMany(LogModel, {
    foreignKey: "operation_id",
    as: "logs"
});
LogModel.belongsTo(OperationModel, {
    foreignKey: "operation_id",
    as: "operation",
    onDelete: "SET NULL"
});
/* Logs - Tables
* Un table puede tener muchos logs
* Un log puede tener soo un table
*/
TableModel.hasMany(LogModel, {
    foreignKey: "table_id",
    as: "logs"
});
LogModel.belongsTo(TableModel, {
    foreignKey: "table_id",
    as: "table",
    onDelete: "SET NULL"
});
export { OperationModel, TableModel, LogModel };
