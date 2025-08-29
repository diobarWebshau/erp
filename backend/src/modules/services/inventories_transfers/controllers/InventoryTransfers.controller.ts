import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    InventoryTransferModel,
    ProductModel, LocationModel,
    LocationTypeModel,
    LocationLocationTypeModel,
    InventoryLocationItemModel,
    InventoryModel, InputModel
} from "../../../associations.js";
import sequelize
    from "../../../../mysql/configSequelize.js";
import {
    InventoryCreationAttributes,
    InventoryLocationItemAttributes,
    LocationAttributes
} from "../../../../modules/types.js";

class InventoryTransfersController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await InventoryTransferModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Inventory transfers no founds" });
                return;
            }
            const tranfers = response.map(i => i.toJSON());
            res.status(200).json(tranfers);
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
            const response = await InventoryTransferModel.findOne({
                where: { id: id }
            });
            if (!response) {
                res.status(200).json({ validation: "Inventory transfers no found" });
                return;
            }
            const trasnfers = response.toJSON();
            res.status(200).json(trasnfers);
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    /*
        * Una transferencia de inventario require dos locations validas, que no sean ambas la misma
        * Ambas locaciones deben ser de tipo "store"
        * Item_type debe ser unicamente product o input
        * item_id debe ser valido dependiendo del item_type
    */
    static create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {
            item_type, item_id, qty,
            reason, source_location_id,
            destination_location_id
        } = req.body;
        try {
            if (source_location_id
                === destination_location_id) {
                res.status(400).json({
                    validation:
                        `Source and destination `
                        + `locations must be different`
                });
                return;
            }
            if (!(qty > 0)) {
                res.status(400).json({
                    validation:
                        `The quantity must be greater `
                        + `than zero to perform `
                        + `an inventory transfer`
                });
                return;
            }
            const [
                sourceLocation,
                destinationLocation
            ] = await Promise.all([
                LocationModel.findByPk(source_location_id),
                LocationModel.findByPk(destination_location_id)
            ]);

            if (!sourceLocation) {
                res.status(404).json({
                    validation:
                        `The source location does not exist`
                });
                return;
            }
            if (!destinationLocation) {
                res.status(404).json({
                    validation:
                        "The destination location does not exist"
                });
                return;
            }
            const [
                sourceLocationType,
                destinationLocationType
            ] = await Promise.all([
                LocationModel.findOne({
                    where: { id: source_location_id },
                    attributes:
                        LocationModel
                            .getAllFields(),
                    include: {
                        model: LocationLocationTypeModel,
                        as: "location_location_type",
                        attributes:
                            LocationLocationTypeModel
                                .getAllFields(),
                        include: [{
                            model: LocationTypeModel,
                            as: "location_type",
                            attributes:
                                LocationTypeModel
                                    .getAllFields(),
                            where: { name: "Store" }
                        }]
                    }
                }),
                LocationModel.findOne({
                    where: { id: destination_location_id },
                    attributes:
                        LocationModel
                            .getAllFields(),
                    include: {
                        model: LocationLocationTypeModel,
                        as: "location_location_type",
                        attributes:
                            LocationLocationTypeModel
                                .getAllFields(),
                        include: [{
                            model: LocationTypeModel,
                            as: "location_type",
                            attributes:
                                LocationTypeModel
                                    .getAllFields(),
                            where: { name: "Store" }
                        }]
                    }
                })
            ]);
            if (!sourceLocationType) {
                res.status(400).json({
                    validation:
                        `The source location must`
                        + ` be of type store`
                });
                return;
            }
            if (!destinationLocationType) {
                res.status(400).json({
                    validation:
                        `The destination location must`
                        + ` be of type store`
                });
                return;
            }
            if (item_type !== "product"
                && item_type !== "input") {
                res.status(400).json({
                    validation:
                        `The item type is not valid`
                });
                return;
            }
            let itemModel: any;
            if (item_type === "product") {
                itemModel = ProductModel;
            }
            else {
                itemModel = InputModel;
            }
            const item =
                await itemModel.findByPk(item_id);

            if (!item) {
                res.status(404).json({
                    validation: `No ${item_type} found`
                });
                return;
            }

            const [
                sourceLocationResponse,
                destinationLocationResponse
            ]: [LocationModel | null, LocationModel | null] =
                await Promise.all([
                    LocationModel.findOne({
                        where: { id: source_location_id },
                        attributes:
                            LocationModel
                                .getAllFields(),
                        include: [{
                            model: InventoryLocationItemModel,
                            as: "inventory_location_item",
                            attributes:
                                InventoryLocationItemModel
                                    .getAllFields(),
                            include: [{
                                model: InventoryModel,
                                as: "inventory",
                                attributes: InventoryModel
                                    .getAllFields()
                            }],
                            where: {
                                item_type: item_type,
                                item_id: item_id
                            }
                        }],
                    }),
                    LocationModel.findOne({
                        where: { id: destination_location_id },
                        attributes:
                            LocationModel
                                .getAllFields(),
                        include: [{
                            model: InventoryLocationItemModel,
                            as: "inventory_location_item",
                            attributes:
                                InventoryLocationItemModel
                                    .getAllFields(),
                            include: [{
                                model: InventoryModel,
                                as: "inventory",
                                attributes:
                                    InventoryModel
                                        .getAllFields()
                            }],
                            where: {
                                item_type: item_type,
                                item_id: item_id
                            }
                        }]
                    })
                ]);

            const sourceLocationInventoryItem:
                LocationAttributes | null =
                sourceLocationResponse?.toJSON() || null;
            const destinationLocationInventoryItem:
                LocationAttributes | null =
                destinationLocationResponse?.toJSON() || null;

            if (!sourceLocationInventoryItem) {
                res.status(404).json({
                    validation:
                        `Item not found in source` +
                        ` location inventory`
                });
                return;
            }
            if (!destinationLocationInventoryItem) {
                res.status(404).json({
                    validation:
                        `Item not found in destination 
                        `+ `location inventory`
                });
                return;
            }
            const sourceInventoryItem =
                sourceLocationInventoryItem
                    ?.inventory_location_item
                    ?.shift() as InventoryLocationItemAttributes;

            const sourceInventory =
                sourceInventoryItem
                    ?.inventory as InventoryCreationAttributes;


            const destinationInventoryItem =
                destinationLocationInventoryItem
                    ?.inventory_location_item
                    ?.shift() as InventoryLocationItemAttributes;
            const destinationInventory =
                destinationInventoryItem
                    ?.inventory as InventoryCreationAttributes;


            if (!sourceInventory || sourceInventory.stock < qty) {
                res.status(400).json({
                    validation:
                        `Not enough quantity available in source location. `
                        + `Available: ${sourceInventory.stock ?? 0}, `
                        + `Requested: ${qty}`
                });
                return;
            }

            // if (Number(destinationInventory.maximum_stock) <
            //     Number(destinationInventory.stock) + Number(qty)) {
            //     res.status(400).json({
            //         validation:
            //             `The destination location would exceed `
            //             + `the maximum stock allowed. Maximum allowed: `
            //             + `${destinationInventory.maximum_stock}, `
            //             + `Resulting stock: ` +
            //             `${Number(destinationInventory.stock) + Number(qty)}`
            //     });
            //     return;
            // }

            const newTransfer =
                await InventoryTransferModel.create({
                    item_type,
                    item_id,
                    item_name: item.toJSON().name,
                    qty,
                    reason,
                    source_location_id,
                    destination_location_id,
                    status: "completed"
                });

            if (!newTransfer) {
                res.status(400).json({
                    validation:
                        "Inventory transfers could not be created"
                });
                return;
            }

            res.status(201).json({
                message:
                    "Inventory transfer created successfully",
            });
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    };

    static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const existingRecord =
                await InventoryTransferModel.findByPk(id);
            if (!existingRecord) {
                res.status(404).json({
                    validation:
                        "The specified inventory transfer record was not found"
                });
                return;
            }

            const relationships = existingRecord.toJSON();
            const editableFields = InventoryTransferModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);

            if (!(Object.keys(update_values).length > 0)) {
                res.status(400).json({
                    validation:
                        "There are no validated inventory transfer properties for the update"
                });
                return;
            }

            if (update_values?.status) {
                if (relationships.status === "completed" &&
                    update_values.status === "completed") {
                    res.status(200).json({
                        validation:
                            "The inventory transfer is already marked as completed"
                    });
                    return;
                } else if (relationships.status === "canceled" &&
                    update_values.status === "canceled") {
                    res.status(200).json({
                        validation:
                            "The inventory transfer is already canceled"
                    });
                    return;
                } else if (relationships.status === "canceled" &&
                    update_values.status === "completed") {
                    res.status(400).json({
                        validation:
                            "A canceled inventory transfer cannot be marked as completed"
                    });
                    return;
                }
            }

            const {
                source_location_id, destination_location_id,
                qty, item_type, item_id
            } = relationships;

            const results =
                await Promise.all([
                    LocationModel.findOne({
                        where: { id: source_location_id },
                        attributes: LocationModel.getAllFields(),
                        include: [{
                            model: InventoryLocationItemModel,
                            as: "inventory_location_item",
                            attributes: InventoryLocationItemModel.getAllFields(),
                            include: [{
                                model: InventoryModel,
                                as: "inventory",
                                attributes: InventoryModel.getAllFields()
                            }],
                            where: {
                                item_type: item_type,
                                item_id: item_id
                            }
                        }],
                    }),
                    LocationModel.findOne({
                        where: { id: destination_location_id },
                        attributes: LocationModel.getAllFields(),
                        include: [{
                            model: InventoryLocationItemModel,
                            as: "inventory_location_item",
                            attributes: InventoryLocationItemModel.getAllFields(),
                            include: [{
                                model: InventoryModel,
                                as: "inventory",
                                attributes: InventoryModel.getAllFields()
                            }],
                            where: {
                                item_type: item_type,
                                item_id: item_id
                            }
                        }]
                    })
                ]);

            const sourceLocationInventoryItem: any = results[0];
            const destinationLocationInventoryItem: any = results[1];

            if (!sourceLocationInventoryItem) {
                res.status(200).json({
                    validation: "Item not found in source location inventory"
                });
                return;
            }
            if (!destinationLocationInventoryItem) {
                res.status(200).json({
                    validation: "Item not found in destination location inventory"
                });
                return;
            }
            const sourceInventoryItem: any =
                sourceLocationInventoryItem.toJSON().inventory_location_item[0];
            const sourceInventory = sourceInventoryItem.inventory

            const destinationInventoryItem: any =
                destinationLocationInventoryItem.toJSON().inventory_location_item[0];
            const destinationInventory = destinationInventoryItem.inventory

            if (!destinationInventory || destinationInventory.stock < qty) {
                res.status(400).json({
                    validation:
                        `Not enough quantity available in the destination location to revert the transfer. `
                        + `Available: ${destinationInventory.stock ?? 0}, Requested: ${qty}`
                });
                return;
            }

            if (Number(sourceInventory.maximum_stock) < Number(sourceInventory.stock) + Number(qty)) {
                res.status(400).json({
                    validation:
                        `Cannot revert the transfer because it would exceed the maximum stock allowed in the source location. `
                        + `Maximum allowed: ${sourceInventory.maximum_stock}, Resulting stock: ${sourceInventory.stock + qty}`
                });
                return;
            }

            const response = await InventoryTransferModel.update(
                update_values,
                {
                    where: { id: id },
                    individualHooks: true
                }
            );

            if (!(response[0] > 0)) {
                res.status(200).json({
                    message:
                        "No changes were made to the inventory transfers"
                });
                return;
            }

            // await sequelize.query(
            //     `CALL revert_inventory_transfer(:transferId)`,
            //     {
            //         replacements: {
            //             transferId: id
            //         }
            //     }
            // );

            res.status(200).json({ message: "Inventory transfers updated successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const existingRecord = await InventoryTransferModel.findByPk(id);
            if (!existingRecord) {
                res.status(404).json({
                    validation: "The specified inventory transfer record was not found"
                });
                return;
            }
            const relationships = existingRecord.toJSON();
            if (relationships.status !== "canceled") {
                const {
                    source_location_id, destination_location_id,
                    qty, item_type, item_id
                } = relationships;

                const results =
                    await Promise.all([
                        LocationModel.findOne({
                            where: { id: source_location_id },
                            attributes: LocationModel.getAllFields(),
                            include: [{
                                model: InventoryLocationItemModel,
                                as: "inventory_location_item",
                                attributes: InventoryLocationItemModel.getAllFields(),
                                include: [{
                                    model: InventoryModel,
                                    as: "inventory",
                                    attributes: InventoryModel.getAllFields()
                                }],
                                where: {
                                    item_type: item_type,
                                    item_id: item_id
                                }
                            }],
                        }),
                        LocationModel.findOne({
                            where: { id: destination_location_id },
                            attributes: LocationModel.getAllFields(),
                            include: [{
                                model: InventoryLocationItemModel,
                                as: "inventory_location_item",
                                attributes: InventoryLocationItemModel.getAllFields(),
                                include: [{
                                    model: InventoryModel,
                                    as: "inventory",
                                    attributes: InventoryModel.getAllFields()
                                }],
                                where: {
                                    item_type: item_type,
                                    item_id: item_id
                                }
                            }]
                        })
                    ]);

                const sourceLocationInventoryItem: any = results[0];
                const destinationLocationInventoryItem: any = results[1];

                if (!sourceLocationInventoryItem) {
                    res.status(200).json({
                        validation: "Deletion blocked: Item not found in source location inventory"
                    });
                    return;
                }
                if (!destinationLocationInventoryItem) {
                    res.status(200).json({
                        validation: "Deletion blocked: Item not found in destination location inventory"
                    });
                    return;
                }
                const sourceInventoryItem: any =
                    sourceLocationInventoryItem.toJSON().inventory_location_item[0];
                const sourceInventory = sourceInventoryItem.inventory

                const destinationInventoryItem: any =
                    destinationLocationInventoryItem.toJSON().inventory_location_item[0];
                const destinationInventory = destinationInventoryItem.inventory

                if (!destinationInventory || destinationInventory.stock < qty) {
                    res.status(400).json({
                        validation:
                            `Deletion blocked: Not enough quantity available in the `
                            + `destination location to revert the transfer. `
                            + `Available: ${destinationInventory.stock ?? 0}, Requested: ${qty}`
                    });
                    return;
                }

                if (Number(sourceInventory.maximum_stock) < Number(sourceInventory.stock) + Number(qty)) {
                    res.status(400).json({
                        validation:
                            `Deletion blocked: Cannot revert the transfer because it `
                            + `would exceed the maximum stock allowed in the source location. `
                            + `Maximum allowed: ${sourceInventory.maximum_stock}, `
                            + `Resulting stock: ${sourceInventory.stock + qty}`
                    });
                    return;
                }
                await sequelize.query(
                    `CALL revert_inventory_transfer(:transferId)`,
                    {
                        replacements: {
                            transferId: id
                        }
                    }
                );
            }
            const response = await InventoryTransferModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(400).json({
                    validation:
                        "Inventory transfers record could not be deleted"
                });
                return;
            }
            res.status(200).json({
                message: "Inventory transfer record deleted successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
}

export default InventoryTransfersController;