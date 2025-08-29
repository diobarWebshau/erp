import { InternalProductionOrderLineProductModel, ProductionLineModel, InternalProductProductionOrderModel, ProductionLineProductModel, ProductModel } from "../../../associations.js";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { Op } from "sequelize";
class InternalProductionOrderLineProductController {
    static getAll = async (req, res, next) => {
        try {
            const response = await InternalProductionOrderLineProductModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validaton: "No internal production orders assigned" +
                        " to production lines were found"
                });
                return;
            }
            const relationships = response.map(pl => pl.toJSON());
            res.status(200).json(relationships);
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
            const response = await InternalProductionOrderLineProductModel.findOne({
                where: { id: id }
            });
            if (!response) {
                res.status(200).json({
                    validation: "No internal production order " +
                        "assigned to production lines were found"
                });
                return;
            }
            const relationships = response.toJSON();
            res.status(200).json(relationships);
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
        const { internal_product_production_order_id, production_line_id } = req.body;
        try {
            const [validateInternalProductProductionOrder, validateLocationProductionLine] = await Promise.all([
                InternalProductProductionOrderModel.
                    findByPk(internal_product_production_order_id),
                ProductionLineModel.
                    findByPk(production_line_id)
            ]);
            if (!validateInternalProductProductionOrder) {
                res.status(200).json({
                    validation: "No internal product production order was found"
                });
                return;
            }
            if (!validateLocationProductionLine) {
                res.status(200).json({
                    validation: "The specified production line could not be found."
                });
                return;
            }
            const internal_product_production_order = validateInternalProductProductionOrder.toJSON();
            const validateProductInProductionLine = await ProductionLineModel.findOne({
                where: { id: production_line_id },
                attributes: ProductionLineModel.getAllFields(),
                include: [{
                        model: ProductionLineProductModel,
                        as: "production_lines_products",
                        attributes: ProductionLineProductModel.getAllFields(),
                        include: [{
                                model: ProductModel,
                                as: "products",
                                attributes: ProductModel.getAllFields(),
                                where: {
                                    id: internal_product_production_order.product_id
                                }
                            }]
                    }]
            });
            if (!validateProductInProductionLine) {
                res.status(200).json({
                    validation: "The product is not associated with the specified"
                        + " production line."
                });
                return;
            }
            const validateInternalProductProductionOrderDuplicate = await InternalProductionOrderLineProductModel.findOne({
                where: {
                    internal_product_production_order_id
                }
            });
            if (validateInternalProductProductionOrderDuplicate) {
                res.status(409).json({
                    validation: "The internal production order is already assigned to "
                        + "the specified production line."
                });
                return;
            }
            const response = await InternalProductionOrderLineProductModel.create({
                internal_product_production_order_id,
                production_line_id
            });
            if (!response) {
                res.status(500).json({
                    validation: "The internal production order could not be " +
                        "assigned to the production line"
                });
                return;
            }
            res.status(200).json({
                message: "The internal production order has been successfully " +
                    "assigned to the production line."
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
        const body = req.body;
        const { id } = req.params;
        try {
            const editableFields = InternalProductionOrderLineProductModel
                .getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            const validateInternalProductProductionOrder = await InternalProductionOrderLineProductModel.findOne({
                where: { id: id }
            });
            if (!validateInternalProductProductionOrder) {
                res.status(404).json({
                    validation: "No internal product production order assigned to "
                        + "production lines was found for the specified ID."
                });
                return;
            }
            const relationships = validateInternalProductProductionOrder.toJSON();
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "There are no valid fields to update."
                });
                return;
            }
            if (update_values?.production_line_id &&
                update_values?.internal_product_production_order_id) {
                const duplicate = await InternalProductionOrderLineProductModel.findOne({
                    where: {
                        production_line_id: update_values
                            .production_line_id,
                        internal_product_production_order_id: update_values
                            .internal_product_production_order_id,
                        id: { [Op.ne]: id }
                    }
                });
                if (duplicate) {
                    res.status(409).json({
                        validation: "This combination of internal production order and "
                            + "production line is already assigned."
                    });
                    return;
                }
            }
            else if (update_values?.internal_product_production_order_id) {
                const internalOrder = await InternalProductProductionOrderModel.findByPk(update_values.internal_product_production_order_id);
                if (!internalOrder) {
                    res.status(404).json({
                        validation: "The specified internal production "
                            + "order does not exist."
                    });
                    return;
                }
                const internal_product_production_order = internalOrder.toJSON();
                const validateProductInProductionLine = await ProductionLineModel.findOne({
                    where: { id: relationships.production_line_id },
                    attributes: ProductionLineModel.getAllFields(),
                    include: [{
                            model: ProductionLineProductModel,
                            as: "location_production_line",
                            attributes: ProductionLineProductModel.getAllFields(),
                            include: [{
                                    model: ProductModel,
                                    as: "products",
                                    attributes: ProductModel.getAllFields(),
                                    where: {
                                        id: internal_product_production_order.product_id
                                    }
                                }]
                        }]
                });
                if (!validateProductInProductionLine) {
                    res.status(200).json({
                        validation: "The product is not associated with the specified"
                            + " production line."
                    });
                    return;
                }
                const duplicate = await InternalProductionOrderLineProductModel.findOne({
                    where: {
                        [Op.and]: [
                            {
                                internal_product_production_order_id: update_values.internal_product_production_order_id
                            },
                            {
                                production_line_id: relationships.production_line_id
                            },
                            {
                                id: {
                                    [Op.ne]: id
                                }
                            }
                        ]
                    }
                });
                if (duplicate) {
                    res.status(409).json({
                        validation: "This internal production order is already assigned "
                            + "to the specified production line."
                    });
                    return;
                }
            }
            else if (update_values?.production_line_id) {
                const location = await ProductionLineModel.findByPk(update_values.production_line_id);
                if (!location) {
                    res.status(404).json({
                        validation: "The specified production line location does not exist."
                    });
                    return;
                }
                const duplicate = await InternalProductionOrderLineProductModel.findOne({
                    where: {
                        [Op.and]: [
                            {
                                internal_product_production_order_id: relationships.internal_product_production_order_id
                            },
                            {
                                production_line_id: update_values.production_line_id
                            },
                            {
                                id: { [Op.ne]: id }
                            }
                        ]
                    }
                });
                if (duplicate) {
                    res.status(409).json({
                        validation: "The specified production line is already assigned to this "
                            + "internal production order."
                    });
                    return;
                }
            }
            const response = await InternalProductionOrderLineProductModel.update(update_values, { where: { id: id }, individualHooks: true });
            if (response[0] === 0) {
                res.status(400).json({
                    validation: "No changes were made. The data may already "
                        + "be up to date."
                });
                return;
            }
            res.status(200).json({
                message: "The internal production order assignment "
                    + "has been successfully updated."
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
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await InternalProductionOrderLineProductModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (response === 0) {
                res.status(404).json({
                    validation: "No internal production order assignment "
                        + "was found with the specified ID."
                });
                return;
            }
            res.status(200).json({
                message: "The internal production order assignment has "
                    + "been successfully deleted."
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
}
export default InternalProductionOrderLineProductController;
