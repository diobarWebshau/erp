import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { PurchasedOrdersProductsLocationsProductionLinesModel, LocationsProductionLinesModel, PurchaseOrderProductModel, ProductionLineModel } from "../../../associations.js";
import { Op } from "sequelize";
class PurchasedOrdersProductsLocationsProductionLinesController {
    static getAll = async (req, res, next) => {
        try {
            const response = await PurchasedOrdersProductsLocationsProductionLinesModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({
                    validation: "PurchasedOrdersProducts-LocationsProductionLines" +
                        " relationships no found"
                });
                return;
            }
            const relationships = response.map(r => r.toJSON());
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
            const response = await PurchasedOrdersProductsLocationsProductionLinesModel
                .findByPk(id);
            if (!response) {
                res.status(404).json({
                    validation: "PurchasedOrdersProducts-LocationsProductionLines "
                        + "relationship no found"
                });
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
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
        const { production_line_id, purchase_order_product_id } = req.body;
        try {
            const [validateLocationProductionLine, validatePurchasedOrderProduct] = await Promise.all([
                LocationsProductionLinesModel.findByPk(production_line_id),
                PurchaseOrderProductModel.findByPk(purchase_order_product_id)
            ]);
            if (!validateLocationProductionLine) {
                res.status(404).json({
                    validation: "The assigned locations-production-lines does not exist"
                });
                return;
            }
            if (!validatePurchasedOrderProduct) {
                res.status(404).json({
                    validation: "The assigned purchased order product does not exist"
                });
                return;
            }
            const validateDuplicate = await PurchasedOrdersProductsLocationsProductionLinesModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            production_line_id: production_line_id
                        },
                        {
                            purchase_order_product_id: purchase_order_product_id
                        }
                    ]
                }
            });
            if (validateDuplicate) {
                res.status(409).json({
                    validation: "PurchasedOrderProducts-LocationsProductionLines"
                        + " relationship already exists"
                });
                return;
            }
            const validatePurchasedOrderProductInSomeLocationProductionLine = await PurchasedOrdersProductsLocationsProductionLinesModel
                .findOne({
                where: {
                    purchase_order_product_id: purchase_order_product_id
                }
            });
            if (validatePurchasedOrderProductInSomeLocationProductionLine) {
                res.status(409).json({
                    validaiton: "The purchased order product has already been"
                        + " assigned to a locations-productionlines"
                });
                return;
            }
            const response = await PurchasedOrdersProductsLocationsProductionLinesModel
                .create({
                production_line_id,
                purchase_order_product_id
            });
            if (!response) {
                res.status(400).json({
                    validation: "The Purchased-orders-products-Location"
                        + "-production-lines relationship could"
                        + " not be created"
                });
                return;
            }
            res.status(201).json({
                message: "The purchased order product has been "
                    + "successfully assigned to a production"
                    + " line of a location "
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
            const validateRelationship = await PurchasedOrdersProductsLocationsProductionLinesModel
                .findByPk(id);
            if (!validateRelationship) {
                res.status(404).json({
                    validation: "PurchasedOrdersProducts-Locations"
                        + "ProductionLines relationship not found"
                });
                return;
            }
            const editableFields = PurchasedOrdersProductsLocationsProductionLinesModel
                .getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            const relationship = validateRelationship.toJSON();
            if (!(Object.keys(update_values).length > 0)) {
                res.status(400).json({
                    validation: "There are no validated purchased order"
                        + " products locations production lines "
                        + "properties for the update"
                });
                return;
            }
            if (update_values?.production_line_id
                || update_values?.purchase_order_product_id) {
                const [validateProductionLine, validatePurchasedOrderProduct] = await Promise.all([
                    update_values?.production_line_id
                        ? ProductionLineModel.findByPk(update_values.production_line_id)
                        : null,
                    update_values?.purchase_order_product_id
                        ? PurchaseOrderProductModel.findByPk(update_values.purchase_order_product_id)
                        : null
                ]);
                if (update_values?.production_line_id &&
                    !validateProductionLine) {
                    res.status(404).json({
                        validation: "The assigned production line"
                            + " does not exists"
                    });
                    return;
                }
                if (update_values?.purchase_order_product_id &&
                    !validatePurchasedOrderProduct) {
                    res.status(404).json({
                        validation: " The assigned PurchasedOrder"
                            + "Product does not exists"
                    });
                    return;
                }
            }
            const validatePurchasedOrderProductInSomeProductionLine = await PurchasedOrdersProductsLocationsProductionLinesModel
                .findOne({
                where: {
                    [Op.and]: [
                        {
                            purchase_order_product_id: update_values.purchase_order_product_id
                                || relationship.purchase_order_product_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validatePurchasedOrderProductInSomeProductionLine) {
                res.status(409).json({
                    validaiton: "The purchased order product has already "
                        + "been assigned to a locations-productionlines"
                });
                return;
            }
            const validateDuplicate = await PurchasedOrdersProductsLocationsProductionLinesModel
                .findOne({
                where: {
                    [Op.and]: [
                        {
                            production_line_id: update_values.production_line_id
                                || relationship.production_line_id
                        },
                        {
                            purchase_order_product_id: update_values.purchase_order_product_id
                                || relationship.purchase_order_product_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateDuplicate) {
                res.status(409).json({
                    validate: "PurchasedOrdersProducts-LocationsProductionLines"
                        + " relationship already exists"
                });
                return;
            }
            const response = await PurchasedOrdersProductsLocationsProductionLinesModel
                .update(update_values, { where: { id: id }, individualHooks: true });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the PurchasedOrdersProducts"
                        + "-LocationsProductionLines relationship"
                });
                return;
            }
            res.status(200).json({
                message: "PurchasedOrdersProducts-LocationsProductionLines"
                    + " relationship updated succefally"
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
    static deleteById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await PurchasedOrdersProductsLocationsProductionLinesModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "PurchasedOrdersProducts-LocationsProductionLines "
                        + "relationship no found for delete"
                });
                return;
            }
            res.status(200).json({
                message: "PurchasedOrdersProducts-LocationsProductionLines"
                    + " relationship deleted successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
}
export default PurchasedOrdersProductsLocationsProductionLinesController;
