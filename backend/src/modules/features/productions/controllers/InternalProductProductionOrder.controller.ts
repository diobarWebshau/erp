import {
    InternalProductProductionOrderModel,
    LocationModel,
    ProductModel,
    InternalProductionOrderLineProductModel
} from "../../../associations.js";
import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    Request, Response, NextFunction
} from "express";
import sequelize
    from "./../../../../mysql/configSequelize.js";
import { QueryTypes } from "sequelize";
import { RelationshipType } from "sequelize/types/errors/database/foreign-key-constraint-error.js";


class InternalProductProductionOrderController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await InternalProductProductionOrderModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json([])
                return;
            }
            const relationships = response.map(pl => pl.toJSON());
            res.status(200).json(relationships);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await InternalProductProductionOrderModel.findOne({
                where: { id: id }
            });
            if (!response) {
                res.status(200).json([]);
                return;
            }
            const relationships = response.toJSON();
            res.status(200).json(relationships);
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const {
            product_id,
            location_id,
            qty
        } = req.body;
        try {

            if (qty <= 0) {
                res.status(400).json({
                    validation: "The quantity must be greater than 0"
                });
                return;
            }

            const [
                validateProduct, validateLocation
            ] = await Promise.all([
                ProductModel.findByPk(product_id),
                LocationModel.findByPk(location_id)
            ]);
            if (!validateProduct) {
                res.status(404).json({
                    validation: "Product does not exist"
                });
                return;
            }
            if (!validateLocation) {
                res.status(404).json({
                    validation: "Location does not exist"
                });
                return;
            }
            const product = validateProduct.toJSON();
            const location = validateLocation.toJSON();
            const asignedInternalOrderProductionLine =
                await sequelize.query(
                    "CALL asigned_internal_order_production_line"
                    + "(:location_id, :product_id , :qty)", {
                    replacements: {
                        location_id: location_id,
                        product_id: product_id,
                        qty: qty
                    },
                });
            interface AsignedInternalOrderProductionLineResponse {
                is_sufficient: number
            }
            const isCapable: AsignedInternalOrderProductionLineResponse =
                asignedInternalOrderProductionLine.shift() as
                AsignedInternalOrderProductionLineResponse;
            if (!isCapable || !isCapable.is_sufficient) {
                res.status(400).json({
                    validation:
                        "The location does not have enough capacity"
                        + " to produce the requested quantity."
                });
                return;
            }
            const asignProductionLineResponse = await sequelize.query(
                "SELECT asign_production_line"
                + "(:location_id, :product_id) AS line", {
                replacements: {
                    product_id: product_id,
                    location_id: location_id
                },
                type: QueryTypes.SELECT

            });
            interface AsignProductionLineResponse {
                line: number
            }
            const production_line_id: AsignProductionLineResponse =
                asignProductionLineResponse.shift() as
                AsignProductionLineResponse;
            if (!production_line_id || production_line_id.line <= 0) {
                res.status(400).json({
                    validation:
                        "No production line at the specified" +
                        " location produces the indicated product."
                });
                return;
            }
            const response = await
                InternalProductProductionOrderModel.create({
                    product_id,
                    qty: qty,
                    status: "pending",
                    product_name: product.name ?? "",
                    location_id: location.id,
                    location_name: location.name
                });
            if (!response) {
                res.status(400).json({
                    message:
                        "The internal product production order"
                        + " could not be created"
                });
                return;
            }
            const internalOrder = response.dataValues;
            await sequelize.query(
                "CALL asing_internal_order" +
                "(:internal_order_id, :production_line_id, :location_id," +
                ":location_name, :product_id, :product_name, :qty)",
                {
                    replacements: {
                        internal_order_id: internalOrder.id,
                        production_line_id: production_line_id.line,
                        location_id: location_id,
                        location_name: location.name,
                        product_id: product_id,
                        product_name: product.name,
                        qty: qty
                    }
                }
            );
            res.status(200).json({
                message:
                    "Internal product production order created successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        let production_line_id: number = 0;
        try {
            const validateInternalOrder = await
                InternalProductProductionOrderModel.findByPk(id);
            if (!validateInternalOrder) {
                res.status(404).json({
                    validation:
                        "Internal product production order not found."
                });
                return;
            }
            const relationship = validateInternalOrder.toJSON();
            const editableFields =
                InternalProductProductionOrderModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            const fieldBlockedProduction = ["product_id", "qty"];
            const isContainBlockField =
                fieldBlockedProduction.some((element, index) => {
                    return element in update_values;
                });

            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "There are no valid fields to update."
                });
                return;
            }

            const validateOrderHasProductionResponse =
                await sequelize.query(
                    "SELECT order_has_production"
                    + "(:order_id, :order_type) AS has_production;",
                    {
                        replacements: {
                            order_id: id,
                            order_type: "internal"
                        },
                        type: QueryTypes.SELECT
                    }
                );

            interface validationOrder {
                has_production: number
            }
            const validateOrderHasProduction: validationOrder
                = validateOrderHasProductionResponse.shift() as validationOrder;
            const isOrderHasProduction: number =
                validateOrderHasProduction.has_production;
            if (isContainBlockField && isOrderHasProduction === 1) {
                res.status(400).json({
                    validation:
                        "You can't change the product or quantity "
                        + "because production for this internal "
                        + "order has already started."
                });
                return;
            }
            if (update_values?.qty) {
                if (!(update_values.qty > 0)) {
                    res.status(200).json({
                        validation: "Quantity must be greater than zero"
                    });
                    return;
                }
            }
            // Validación opcional si se cambia el product_id
            if (update_values?.product_id) {
                const validateProduct = await
                    ProductModel.findByPk(update_values.product_id);
                if (!validateProduct) {
                    res.status(404).json({
                        validation: "The specified product does not exist."
                    });
                    return;
                }
                update_values.product_name = validateProduct.toJSON().name;
            }
            if (isContainBlockField && isOrderHasProduction === 0) {
                await sequelize.query(
                    "CALL delete_pending_production_order_by_reference "
                    + "(:order_id, :order_type);",
                    {
                        replacements: {
                            order_id: id,
                            order_type: "internal"
                        }
                    }
                );
                const asignProductionLineResponse = await sequelize.query(
                    "SELECT asign_production_line"
                    + "(:location_id, :product_id) AS line", {
                    replacements: {
                        product_id: update_values?.product_id || relationship.product_id,
                        location_id: relationship.location_id
                    },
                    type: QueryTypes.SELECT

                });
                interface AsignProductionLineResponse {
                    line: number
                }
                const productionLineObject: AsignProductionLineResponse =
                    asignProductionLineResponse.shift() as
                    AsignProductionLineResponse;
                production_line_id = productionLineObject.line;
                if (production_line_id <= 0) {
                    res.status(400).json({
                        validation:
                            "No production line at the specified" +
                            " location produces the indicated product."
                    });
                    return;
                }

            }
            const response = await InternalProductProductionOrderModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (response[0] === 0) {
                res.status(400).json({
                    validation:
                        "No changes were made to the internal product production order."
                });
                return;
            }
            const validateInternalOrderReturn =
                await InternalProductProductionOrderModel.findByPk(id);
            if (isContainBlockField && isOrderHasProduction === 0) {
                if (validateInternalOrderReturn) {
                    const internalOrder = validateInternalOrderReturn.toJSON();
                    await sequelize.query(
                        "CALL asing_internal_order" +
                        "(:internal_order_id, :production_line_id, :location_id," +
                        ":location_name, :product_id, :product_name, :qty)",
                        {
                            replacements: {
                                internal_order_id: internalOrder.id,
                                production_line_id: production_line_id,
                                location_id: internalOrder.location_id,
                                location_name: internalOrder.location_name,
                                product_id: internalOrder.product_id,
                                product_name: internalOrder.product_name,
                                qty: internalOrder.qty
                            }
                        }
                    );
                }
            }
            // if (validateInternalOrderReturn){
            //     const internalOrder = validateInternalOrderReturn.toJSON();
            //     if (internalOrder.status === "completed"){

            //     }
            // }
            res.status(200).json({
                message: "Internal product production order updated successfully."
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
                res.status(500).json({
                    message: "An unexpected error occurred. Please try again later."
                });
            }
        }
    };

    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validateInternalOrder =
                await InternalProductProductionOrderModel.findByPk(id);
            if (!validateInternalOrder) {
                res.status(404).json({
                    validation: "Internal product production order not found."
                });
                return;
            }
            const response = await InternalProductProductionOrderModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(400).json({
                    validation:
                        "The internal product production order could not be deleted."
                });
                return;
            }
            res.status(200).json({
                message: "Internal product production order deleted successfully."
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
                res.status(500).json({
                    message: "An unexpected error occurred. Please try again later."
                });
            }
        }
    };

    static revertProductionOfIppo = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            await sequelize.query('CALL revert_asign_internal_after_update(:id)', {
                replacements: {
                    id: id
                },
                type: QueryTypes.RAW
            });
            res.sendStatus(200);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`);
            }
        }
    }

}

export default InternalProductProductionOrderController;