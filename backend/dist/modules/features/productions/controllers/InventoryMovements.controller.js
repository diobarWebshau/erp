import collectorUpdateFields from "./../../../../scripts/collectorUpdateField.js";
import { InputModel, InventoryMovementModel, LocationModel, ProductModel, } from '../../../associations.js';
import sequelize from "../../../../mysql/configSequelize.js";
class InvetoryMovementsController {
    static getAll = async (req, res, next) => {
        try {
            const response = await InventoryMovementModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({
                    validation: 'Inventory movements no found'
                });
                return;
            }
            const inventoryMovements = response.map(c => c.toJSON());
            res.status(200).json(inventoryMovements);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`
                        An unexpected error occurred: ${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await InventoryMovementModel.findByPk(id);
            if (!response) {
                res.status(404).json({
                    validation: 'Inventory movement no found'
                });
                return;
            }
            const inventoryMovement = response.toJSON();
            res.status(200).json(inventoryMovement);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`
                        An unexpected error occurred: ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { location_id, item_id, item_type, qty, movement_type, description, production_id, is_locked } = req.body;
        try {
            // usamos el tipo base de cualquier modelo Sequelize
            let location_name, item_name;
            let itemModel;
            // let referenceModel: ModelStatic<Model> | null;
            let is_locked_default = 0;
            switch (item_type) {
                case "product":
                    itemModel = ProductModel;
                    break;
                case "input":
                    itemModel = InputModel;
                    break;
                default:
                    res.status(400).json({
                        validation: 'Invalid item type'
                    });
                    return;
            }
            // switch (reference_type) {
            //     case "production":
            //         referenceModel = ProductionModel;
            //         is_locked_default = 1;
            //         break;
            //     case "order":
            //         referenceModel = PurchaseOrderProductModel;
            //         is_locked_default = 1;
            //         break;
            //     case "transfer":
            //         referenceModel = InventoryTransferModel;
            //         break;
            //     default:
            //         referenceModel = null;
            //         break;
            // }
            const [validateLocation, validateItem,
            // validateReference
            ] = await Promise.all([
                LocationModel.findByPk(location_id),
                itemModel.findByPk(item_id),
                // (referenceModel) ?
                //     referenceModel.findByPk(reference_id)
                //     : Promise.resolve(null)
            ]);
            null;
            if (!validateLocation) {
                res.status(404).json({
                    validation: 'Location does not exist'
                });
                return;
            }
            if (!validateItem) {
                res.status(404).json({
                    validation: `The ${item_type} does not exist`
                });
                return;
            }
            // if (!validateReference && referenceModel !== null) {
            //     res.status(404).json({
            //         validation:
            //             `Reference ${reference_type} to does `
            //             + `not exist`
            //     });
            //     return;
            // }
            location_name = validateLocation.toJSON().name;
            item_name = validateItem.toJSON().name;
            const response = await InventoryMovementModel.create({
                location_id,
                location_name,
                item_id,
                item_type,
                item_name,
                qty,
                movement_type,
                reference_id: null,
                // reference_type: null,
                reference_type: "Purchased",
                description: description ?? null,
                is_locked: is_locked ?? is_locked_default,
                production_id: production_id ?? null
            });
            if (!response) {
                res.status(400).json({
                    validation: 'Inventory movement could not be created'
                });
                return;
            }
            /*****
             * AQUI LOGICA DE SETTINGS PARA ACTIVAR O DESACTIVAR ASIGNACION AUTOMATICA
             *
             */
            if (true) {
                await sequelize.query(`CALL process_waiting_purchased_orders_products();`);
            }
            res.status(201).json({
                message: "Inventory movement created",
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`
                    An unexpected error occurred: ${error}`);
            }
        }
    };
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validateInventoryMovement = await InventoryMovementModel.findByPk(id);
            if (!validateInventoryMovement) {
                res.status(404).json({
                    validation: 'Inventory movement no found'
                });
                return;
            }
            const relationships = validateInventoryMovement.toJSON();
            const editableFields = InventoryMovementModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "No validated inventory movements "
                        + "properties were found for updating"
                });
                return;
            }
            if (update_values?.is_locked) {
                if (relationships.is_locked === 0) {
                    res.status(400).json({
                        validation: "Inventory movement was already completed"
                    });
                    return;
                }
            }
            const response = await InventoryMovementModel.update(update_values, { where: { id: id }, individualHooks: true });
            if (!response) {
                res.status(400).json({
                    validation: 'Inventory movement could not be updated'
                });
                return;
            }
            /*****
             * AQUI LOGICA DE SETTINGS PARA ACTIVAR O DESACTIVAR ASIGNACION AUTOMATICA
             *
             */
            if (true) {
                await sequelize.query(`CALL process_waiting_purchased_orders_products();`);
            }
            res.status(200).json({
                message: "Inventory movement updated",
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`
                        An unexpected error occurred: ${error}`);
            }
        }
    };
}
export default InvetoryMovementsController;
