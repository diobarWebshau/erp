import { ProductionModel, ProductModel, ProductionOrderModel, PurchaseOrderProductModel } from "../../../associations.js";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { Op } from "sequelize";
class ProductionsController {
    static getAll = async (req, res, next) => {
        try {
            const response = await ProductionModel.findAll();
            if (response.length < 1) {
                res.status(404).json({
                    validation: "Productions no found"
                });
                return;
            }
            const productions = response.map(u => u.toJSON());
            res.status(200).json(productions);
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
            const response = await ProductionModel.findByPk(id);
            if (!response) {
                res.status(404).json({
                    validation: "Production no found"
                });
                return;
            }
            const production = response.toJSON();
            res.status(200).json(production);
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
    static create = async (req, res, next) => {
        const { production_order_id, product_id, qty, process_id } = req.body;
        try {
            if (!(qty > 0)) {
                res.status(400).json({
                    validation: "The quantity must be greater than"
                        + " zero to create a production."
                });
                return;
            }
            const [validateProductionOrder, validateProduct] = await Promise.all([
                ProductionOrderModel.findByPk(production_order_id),
                ProductModel.findByPk(product_id)
            ]);
            if (!validateProductionOrder) {
                res.status(404).json({
                    validation: "The production order does not exist"
                });
                return;
            }
            if (!validateProduct) {
                res.status(404).json({
                    validation: "The product does not exist"
                });
                return;
            }
            const productionOrder = validateProductionOrder.toJSON();
            const product = validateProduct.toJSON();
            if (productionOrder.product_id !== product.id) {
                res.status(400).json({
                    validation: "The product does not match the one "
                        + "assigned to the production order"
                });
                return;
            }
            const validateQtyProductionOrder = await ProductionOrderModel.findOne({
                where: { id: production_order_id },
                attributes: ProductionOrderModel.getAllFields(),
                include: [{
                        model: ProductionModel,
                        as: "productions",
                        attributes: ProductionModel.getAllFields(),
                        required: false,
                        where: {
                            process_id: process_id
                        }
                    }]
            });
            if (!(validateQtyProductionOrder)) {
                res.status(404).json({
                    validation: "Production order not found or "
                        + "contains no productions."
                });
                return;
            }
            const productionOrderWithProductions = validateQtyProductionOrder.toJSON();
            const productions = productionOrderWithProductions.productions;
            const productionOrderQty = Number(productionOrderWithProductions.qty);
            if (productions.length > 0) {
                const totalProduced = productions.reduce((acc, production) => acc + Number(production.qty), 0);
                if (totalProduced
                    === productionOrderWithProductions.qty) {
                    res.status(400).json({
                        validation: `Cannot create a new production. `
                            + `The total required quantity `
                            + `(${productionOrderQty})`
                            + ` has already been produced.`
                    });
                    return;
                }
                else if (totalProduced + qty
                    > productionOrderQty) {
                    res.status(400).json({
                        validation: `The entered quantity (${qty}) `
                            + `exceeds the remaining units `
                            + `for this production order. `
                            + `A total of ${totalProduced} out of `
                            + `${productionOrderQty} `
                            + `units has already been produced.`
                    });
                    return;
                }
            }
            else {
                if (qty
                    > productionOrderQty) {
                    res.status(400).json({
                        validation: `The entered quantity (${qty}) `
                            + `exceeds the remaining units `
                            + `for this production order. `
                            + `A total of ${0} out of `
                            + `${productionOrderQty} `
                            + `units has already been produced.`
                    });
                    return;
                }
            }
            const response = await ProductionModel.create({
                production_order_id,
                product_id,
                product_name: product.name ?? "",
                qty,
                process_id
            });
            if (!response) {
                res.status(400).json({
                    validation: "Production could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Production created successfully"
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
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validateProduction = await ProductionModel.findByPk(id);
            if (!validateProduction) {
                res.status(200).json({
                    validation: "Production does not exist"
                });
                return;
            }
            const relationship = validateProduction.toJSON();
            const editableFields = ProductionModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation: "No valid fields were provided to"
                        + " update the production"
                });
                return;
            }
            if (update_values?.qty) {
                const validateQtyProductionOrder = await ProductionOrderModel.findOne({
                    where: {
                        id: relationship.production_order_id
                    },
                    attributes: ProductionOrderModel.getAllFields(),
                    include: [{
                            model: ProductionModel,
                            as: "productions",
                            attributes: ProductionModel.getAllFields(),
                            required: false, // sino se encuentra production, no retornara null
                            where: {
                                id: { [Op.ne]: id },
                                process_id: relationship.process_id
                            }
                        }]
                });
                if (!(validateQtyProductionOrder)) {
                    res.status(404).json({
                        validation: "Production order not found"
                    });
                    return;
                }
                const productionOrderWithProductions = validateQtyProductionOrder.toJSON();
                const productions = productionOrderWithProductions.productions;
                const productionOrderQty = Number(productionOrderWithProductions.qty);
                if (productions.length > 0) {
                    const totalProduced = productions.reduce((acc, production) => acc + Number(production.qty), 0);
                    if (totalProduced
                        === productionOrderWithProductions.qty) {
                        res.status(400).json({
                            validation: `Cannot create a new production. `
                                + `The total required quantity `
                                + `(${productionOrderQty})`
                                + ` has already been produced.`
                        });
                        return;
                    }
                    else if (totalProduced + update_values.qty
                        > productionOrderQty) {
                        res.status(400).json({
                            validation: `The entered quantity (${update_values.qty}) `
                                + `exceeds the remaining units `
                                + `for this production order. `
                                + `A total of ${totalProduced} out of `
                                + `${productionOrderQty} `
                                + `units has already been produced.`
                        });
                        return;
                    }
                }
                else {
                    if (update_values.qty
                        > productionOrderQty) {
                        res.status(400).json({
                            validation: `The entered quantity (${update_values.qty}) `
                                + `exceeds the remaining units `
                                + `for this production order. `
                                + `A total of ${0} out of `
                                + `${productionOrderQty} `
                                + `units has already been produced.`
                        });
                        return;
                    }
                }
            }
            const response = await ProductionModel.update(update_values, { where: { id: id }, individualHooks: true });
            if (!(response[0] > 0)) {
                res.status(400).json({
                    validation: "No changes were applied to the production record"
                });
                return;
            }
            res.status(200).json({
                message: "Production updated successfully"
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
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validateProductionOrder = await ProductionModel.findOne({
                where: { id: id },
                attributes: ProductionModel.getAllFields(),
                include: [{
                        model: ProductionOrderModel,
                        attributes: ProductionOrderModel.getAllFields(),
                        as: "production_order",
                    }]
            });
            if (!validateProductionOrder) {
                res.status(404).json({
                    validation: "Production not found"
                });
                return;
            }
            const productionDetail = validateProductionOrder.toJSON();
            if (!productionDetail.production_order) {
                res.status(404).json({
                    validation: "Related production order not found"
                });
                return;
            }
            if (productionDetail.production_order.order_type === 'client') {
                const validatePurchaseOrderProduct = await PurchaseOrderProductModel.findByPk(productionDetail.production_order.order_id);
                if (!validatePurchaseOrderProduct) {
                    res.status(404).json({
                        validation: "Related purchase order product not found"
                    });
                    return;
                }
                const purcahsedOrderProduct = validatePurchaseOrderProduct.toJSON();
                if (purcahsedOrderProduct.status === "shipping") {
                    res.status(400).json({
                        validation: "Production cannot be deleted because "
                            + "the order is already in shipping status"
                    });
                    return;
                }
            }
            const response = await ProductionModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (response < 1) {
                res.status(404).json({
                    validation: "Production not found for deleted"
                });
                return;
            }
            res.status(200).json({
                message: "Production deleted successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred ${error}`);
            }
        }
    };
}
export default ProductionsController;
