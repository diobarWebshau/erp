import { Request, Response, NextFunction }
    from "express";
import {
    InventoryModel, InventoryLocationItemModel,
    LocationLocationTypeModel,
    LocationModel, LocationTypeModel,
    ProductModel, InputModel
} from "../../../associations.js";
import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { Op } from "sequelize";

class InventoriesLocationsItemsController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await InventoryLocationItemModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({
                    validation:
                        "Item inventories not found at the specified location"
                });
                return;
            }
            const locationsInventoriesItems = response.map(i => i.toJSON());
            res.status(200).json(locationsInventoriesItems);
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await InventoryLocationItemModel.findByPk(id);
            if (!response) {
                res.status(404).json({
                    validation:
                        "Item inventory not found at the specified location"
                });
                return;
            }
            const locationsInventoriesItems = response.toJSON();
            res.status(200).json(locationsInventoriesItems);
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static get = async (req: Request, res: Response, next: NextFunction) => {
        const { location_id, item_type, item_id } = req.params;
        try {
            const response = await InventoryLocationItemModel.findOne({
                where: {
                    location_id, item_id, item_type
                }
            });
            if (!response) {
                res.status(404).json({
                    validation:
                        "Item inventory not found at the specified location"
                });
                return;
            }
            const locationsInventoriesItems = response.toJSON();
            res.status(200).json(locationsInventoriesItems);
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    /*
        * El inventory_id solo debe estar referenciado una unica vez
        en locationsInventoriesItems
        * El location_type debe ser de tipo store para poder tener
        inventarios
        * El item type solo puede ser unicamente ciertos valores 
        [product, input]
        * La combinacion entre item_id, item_type y location_type debe
        ser unico en si misma
    */
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { inventory_id, item_type, item_id, location_id } = req.body;
        try {
            const inventory = await InventoryModel.findByPk(inventory_id);
            if (!inventory) {
                res.status(404).json({
                    validation: "The specified inventory does not exist."
                });
                return;
            }

            const inventoryAlreadyAssigned = await InventoryLocationItemModel.findOne({
                where: { inventory_id }
            });
            if (inventoryAlreadyAssigned) {
                res.status(409).json({
                    validation: "This inventory is already assigned to a location."
                });
                return;
            }

            const location = await LocationModel.findByPk(location_id);
            if (!location) {
                res.status(404).json({
                    validation: "The specified location does not exist."
                });
                return;
            }

            const isStoreLocation = await LocationModel.findOne({
                where: { id: location_id },
                include: {
                    model: LocationLocationTypeModel,
                    as: "location_location_type",
                    include: [{
                        model: LocationTypeModel,
                        as: "location_type",
                        where: { name: "Store" }
                    }]
                }
            });
            if (!isStoreLocation) {
                res.status(400).json({
                    validation:
                        "Inventory can only be assigned to locations of type 'Store'."
                });
                return;
            }

            const validItemTypes = ["product", "input"];
            if (!validItemTypes.includes(item_type)) {
                res.status(400).json({
                    validation:
                        "Invalid item type. Only 'product' or 'input' are allowed."
                });
                return;
            }

            if (item_type === "product") {
                const product = await ProductModel.findByPk(item_id);
                if (!product) {
                    res.status(404).json({
                        validation: "The specified product does not exist."
                    });
                    return;
                }
            }
             else {
                const input = await InputModel.findByPk(item_id);
                if (!input) {
                    res.status(404).json({
                        validation: "The specified input does not exist."
                    });
                    return;
                }
            }

            const duplicateEntry = await InventoryLocationItemModel.findOne({
                where: { item_id, item_type, location_id }
            });
            if (duplicateEntry) {
                res.status(409).json({
                    validation:
                        "This item already has inventory at the specified location."
                });
                return;
            }
            const created = await InventoryLocationItemModel.create({
                inventory_id,
                item_type,
                item_id,
                location_id
            });
            res.status(201).json({
                message: "Inventory created successfully."
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`Unexpected error: ${error}`);
            }
        }
    };

    /*
        * El inventory_id solo debe estar referenciado una unica vez
          en locationsInventoriesItems
        * El location_type de location debe ser de tipo store para poder tener
          inventarios
        * El item type solo puede ser unicamente ciertos valores 
          [product, input]
        * La combinacion entre item_id, item_type y location_type debe
          ser unico en si misma
    */
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const existingRecord = await InventoryLocationItemModel.findByPk(id);
            if (!existingRecord) {
                res.status(404).json({
                    validation:
                        "The specified inventory record was not found."
                });
                return;
            }

            const current = existingRecord.toJSON();
            const editableFields = InventoryLocationItemModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);

            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "There are no validated inventory properties for the update."
                });
                return;
            }

            const [
                inventoryExists,
                inventoryAlreadyAssigned,
                location,
                locationWithType
            ] = await Promise.all([
                update_values.inventory_id ?
                    InventoryModel.findByPk(update_values.inventory_id) : null,
                update_values.inventory_id ?
                    InventoryLocationItemModel.findOne({
                        where: {
                            inventory_id: update_values.inventory_id,
                            id: { [Op.ne]: id }
                        }
                    }) : null,
                update_values.location_id ?
                    LocationModel.findByPk(update_values.location_id) : null,
                update_values.location_id ?
                    LocationModel.findOne({
                        where: { id: update_values.location_id },
                        include: {
                            model: LocationLocationTypeModel,
                            as: "location_location_type",
                            include: [{
                                model: LocationTypeModel,
                                as: "location_type",
                                where: { name: "Store" }
                            }]
                        }
                    }) : null
            ]);

            if (update_values?.inventory_id && !inventoryExists) {
                res.status(404).json({
                    validation: "Inventory assigned does not exist."
                });
                return;
            }

            if (update_values?.inventory_id && inventoryAlreadyAssigned) {
                res.status(409).json({
                    validation:
                        "This inventory is already assigned to another location."
                });
                return;
            }

            if (update_values?.location_id && !location) {
                res.status(400).json({
                    validation: "The location assigned does not exist."
                });
                return;
            }

            if (update_values?.location_id && !locationWithType) {
                res.status(400).json({
                    validation:
                        "Inventory can only be assigned to "
                        + "locations of type store."
                });
                return;
            }

            // Validación del tipo de ítem
            const finalItemType = update_values.item_type || current.item_type;
            const finalItemId = update_values.item_id || current.item_id;

            if (!["product", "input"].includes(finalItemType)) {
                res.status(400).json({
                    validation:
                        "The item type is invalid. Only 'product' "
                        + "or 'input' are allowed."
                });
                return;
            }

            // const itemExists = finalItemType === "product"
            //     ? await ProductModel.findByPk(finalItemId)
            //     : await InputModel.findByPk(finalItemId);
            let itemExists;
            if (finalItemType === "product") {
                itemExists = await ProductModel.findByPk(finalItemId);
            }
            else {
                itemExists = await InputModel.findByPk(finalItemId);
            }

            if (!itemExists) {
                res.status(400).json({
                    validation: `The ${finalItemType} assigned does not exist.`
                });
                return;
            }

            const finalLocationId = update_values.location_id || current.location_id;
            const duplicateCombination = await InventoryLocationItemModel.findOne({
                where: {
                    item_id: finalItemId,
                    item_type: finalItemType,
                    location_id: finalLocationId,
                    id: { [Op.ne]: id }
                }
            });

            if (duplicateCombination) {
                res.status(400).json({
                    validation:
                        "This combination of item_id, item_type and " +
                        "location_id is already in use."
                });
                return;
            }
            const result = await InventoryLocationItemModel.update(
                update_values,
                {
                    where: { id },
                    individualHooks: true
                }
            );
            if (result[0] === 0) {
                res.status(200).json({
                    validation: "No changes were made to the inventory"
                });
                return;
            }
            res.status(200).json({
                message: "Inventory updated successfully."
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`Unexpected error: ${error}`);
            }
        }
    };

    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await InventoryLocationItemModel.destroy({
                where: { id },
                individualHooks: true
            });

            if (!response) {
                res.status(404).json({
                    validation:
                        "No inventory record found for the "
                        + "specified item at the given location"
                });
                return;
            }
            res.status(200).json({
                message:
                    "Inventory linkage between the specified item "
                    + "and location has been successfully deleted"
            });
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`Unexpected error: ${error}`);
            }
        }
    };

}

export default InventoriesLocationsItemsController;