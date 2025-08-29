// MODULE CORE
import { ClientModel } from "./core/associations.js";
// MODULE SERVICES
import { 
// LOGS MODULE
LogModel, OperationModel, TableModel, } from "./services/associations.js";
/****************************************
 *                                      *
 *          Hooks core modules          *
 *                                      *
 ***************************************/
ClientModel.addHook("beforeUpdate", async (instance, options) => {
    const tableName = "clients";
    const operation_name = 'update';
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ClientModel.addHook("beforeCreate", async (instance, options) => {
    const tableName = "clients";
    const operation_name = 'create';
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: {
                name: operation_name
            }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    // Log creation
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ClientModel.addHook("beforeDestroy", async (instance, options) => {
    const tableName = "clients";
    const operation_name = 'delete';
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    // Log deletion
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
