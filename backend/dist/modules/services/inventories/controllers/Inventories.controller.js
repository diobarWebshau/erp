import { InventoryLocationItemModel, InventoryModel, InventoryMovementModel } from "../../../associations.js";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { QueryTypes, Transaction } from "sequelize";
class InventoriesController {
    static getAll = async (req, res, next) => {
        try {
            const response = await InventoryModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({ validation: "Inventories no founds" });
                return;
            }
            const inventories = response.map(i => i.toJSON());
            res.status(200).json(inventories);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await InventoryModel.findByPk(id);
            if (!response) {
                res.status(404).json({ validation: "Inventory no found" });
                return;
            }
            const inventory = response.toJSON();
            res.status(200).json(inventory);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { stock, minimum_stock, maximum_stock, lead_time } = req.body;
        try {
            const response = await InventoryModel.create({
                stock,
                minimum_stock,
                maximum_stock,
                lead_time
            });
            if (!response) {
                res.status(404).json({
                    validation: "The inventory could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Inventory created successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const editableFields = InventoryModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(400).json({
                    validation: "There are no validated inventory properties for the update"
                });
                return;
            }
            const validateInventory = await InventoryModel.findByPk(id);
            if (!validateInventory) {
                res.status(404).json({ validation: "Inventory no found" });
                return;
            }
            const response = await InventoryModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the inventory"
                });
                return;
            }
            res.status(200).json({ message: "Inventory updated successfully" });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await InventoryModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(404).json({
                    validation: "Inventory no found for deleted"
                });
                return;
            }
            res.status(200).json({ message: "Inventory deleted successfully" });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getInventoryDetails = async (req, res, next) => {
        try {
            const response = await sequelize.query('CALL getInventoryAllLocations();', { type: QueryTypes.RAW });
            const inventoriesObject = response.shift();
            const inventories = inventoriesObject.inventories;
            res.status(200).json(inventories);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getAllItemsOnInventory = async (req, res, next) => {
        try {
            const response = await sequelize.query(`SELECT funct_get_generic_items_with_locations() AS items`, { type: QueryTypes.SELECT });
            const items = response.shift();
            res.status(200).json(items.items);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getAllItemsLike = async (req, res, next) => {
        const { excludeProductIds = [], excludeInputIds = [] } = req.body;
        const like = req.params.filter ?? null;
        const contains = 0; // 0 = prefijo (usa índice), 1 = contiene
        try {
            const response = await sequelize.query('SELECT funct_get_generic_items_with_locations_like_with_exclude(:like, :contains, :exProd, :exInp) AS items', {
                replacements: {
                    like: like ?? null,
                    contains: Number(contains) ? 1 : 0, // 0=prefijo, 1=contiene
                    exProd: JSON.stringify(excludeProductIds), // ej [1,2,3]
                    exInp: JSON.stringify(excludeInputIds), // ej [5,6]
                },
                type: QueryTypes.SELECT,
            });
            const items = response.shift();
            res.status(200).json(items.items);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static createBatch = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
        });
        const inventories = req.body;
        try {
            const productsWithInventory = inventories.filter((inv) => inv.item?.locations.some((location) => location.id === inv.location_id));
            const productsWithoutInventory = inventories.filter((inv) => inv.item?.locations.every((location) => location.id !== inv.location_id));
            if (productsWithoutInventory.length > 0) {
                const copyProductsWithoutInventory = [...productsWithoutInventory];
                for (const inv of copyProductsWithoutInventory) {
                    const inventory = {
                        stock: 0,
                        minimum_stock: inv.minimum_stock || 100,
                        maximum_stock: inv.maximum_stock || 10000,
                        lead_time: inv.lead_time || 10,
                    };
                    const responseCreateSlotOfInventory = await InventoryModel.create(inventory, { transaction });
                    if (!responseCreateSlotOfInventory) {
                        await transaction.rollback();
                        res.status(400).json({
                            validation: "No se pudo crear el registro de inventario "
                        });
                        return;
                    }
                    const inventoryRecord = responseCreateSlotOfInventory.toJSON();
                    const inventoryLocationItem = {
                        inventory_id: inventoryRecord.id,
                        item_type: inv.item_type,
                        item_id: inv.item_id,
                        location_id: inv.location_id,
                    };
                    const responseCreateInventoryLocationItem = await InventoryLocationItemModel.create(inventoryLocationItem, { transaction });
                    if (!responseCreateInventoryLocationItem) {
                        await transaction.rollback();
                        res.status(400).json({
                            validation: `No se pudo asignar el registro de inventario ` +
                                `${inv.item_name} a la ubicación ` +
                                `${inv.location_name}`
                        });
                        return;
                    }
                }
            }
            const inventoriesUpdated = [
                ...productsWithInventory,
                ...productsWithoutInventory
            ];
            console.log(inventoriesUpdated);
            const newInventoryMovements = inventoriesUpdated.map((inv) => {
                const inventoryMovement = {
                    item_id: inv.item_id,
                    location_id: inv.location_id,
                    item_type: inv.item_type,
                    location_name: inv.location_name,
                    item_name: inv.item_name,
                    qty: inv.qty ?? 0,
                    is_locked: 0,
                    movement_type: "in",
                    reference_type: "Purchased",
                    description: null,
                    production_id: null,
                    reference_id: null,
                };
                return inventoryMovement;
            });
            const responseInventoryMovements = await InventoryMovementModel.bulkCreate(newInventoryMovements, { transaction });
            if (responseInventoryMovements.length !== newInventoryMovements.length) {
                await transaction.rollback();
                res.status(400).json({
                    validation: "No se pudo crear los movimientos de inventario"
                });
                return;
            }
            await transaction.commit();
            console.log("Inventarios actualizados correctamente");
            res.status(200).json({
                message: "Inventarios actualizados correctamente"
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
}
export default InventoriesController;
