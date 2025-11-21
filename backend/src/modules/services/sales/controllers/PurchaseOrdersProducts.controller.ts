import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    PurchaseOrderProductModel,
    PurchasedOrderModel, ProductModel
} from "../../../associations.js";
import { validateSafeParseAsync }
    from "../schemas/PurchaseOrderProduct.schema.js";
import sequelize
    from "../../../../mysql/configSequelize.js";
import { Request, Response, NextFunction }
    from "express";
import { Op }
    from "sequelize";

class PurchaseOrderProductController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await PurchaseOrderProductModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({
                    validation:
                        "PurchasedOrder-Product no found"
                });
                return;
            }
            const relationship = response.map(lp => lp.toJSON());
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await
                PurchaseOrderProductModel.findByPk(id);
            if (!response) {
                res.status(404).json({
                    validation:
                        "PurchasedOrder-Product relationship no found"
                });
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getByOrderCode = async (req: Request, res: Response, next: NextFunction) => {
        const { order_code } = req.params;
        try {
            const response = await PurchasedOrderModel.findOne({ where: { order_code: order_code } });
            if (!response) {
                res.status(404).json({ validation: "Purchased order no found" });
                return;
            }
            const purchasedOrder = response.toJSON();
            res.status(200).json(purchasedOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { purchase_order_id, product_id, qty, status } = req.body;
        try {
            const validate_purchase_order_id = await PurchasedOrderModel.
                findOne({ where: { id: purchase_order_id } });
            if (!validate_purchase_order_id) {
                res.status(200).json({
                    validation: "The assigned purcharse order does not exist"
                });
                return;
            }
            const validateproduct = await ProductModel.findOne({ where: { id: product_id } });
            if (!validateproduct) {
                res.status(200).json({
                    validation: "The assigned product does not exist"
                });
                return;
            }
            const validation = await PurchaseOrderProductModel.findOne({
                where: {
                    [Op.and]: [
                        { purchase_order_id: purchase_order_id },
                        { product_id: product_id }
                    ]
                }
            });
            if (validation) {
                res.status(200).json({
                    validation:
                        "PurchasedOrder-Product relationship already exists"
                });
                return;
            }
            const price = await ProductModel.findOne({ where: { id: product_id } });
            if (!price) {
                res.status(200).json({
                    validation:
                        "The product's selling price was not found"
                });
                return;
            }
            const recorded_price = Number(price.toJSON().sale_price);
            const product_name = price.toJSON().name;
            const response = await PurchaseOrderProductModel.create({
                purchase_order_id,
                product_id,
                qty,
                recorded_price,
                product_name: product_name ?? "",
                status: status || "pending",
                original_price: recorded_price
            });
            if (!response) {
                res.status(200).json({
                    validation:
                        "The purchaseOrder-product could not be created"
                });
                return;
            }
            const pop = response.toJSON();
            await sequelize.query(
                `CALL validate_order_completed(:order_id, :order_type);`, {
                replacements: {
                    order_id: pop.id,
                    order_type: 'client'
                }
            });
            res.status(200).json({
                message:
                    "PurchasedOrder-Product relationship created successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static createBatchToPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
        const { purchase_order_id } = req.params;
        const { products } = req.body; // Espera un array de objetos { product_id, qty }
        if (!Array.isArray(products) || products.length === 0) {
            res.status(200).json({ validation: "Invalid or empty product list." });
            return;
        }
        try {
            const validatePurchaseOrder = await PurchasedOrderModel.findOne({ where: { id: purchase_order_id } });
            if (!validatePurchaseOrder) {
                res.status(200).json({ validation: "The assigned purchase order does not exist" });
                return;
            }
            const productIds = products.map(p => Number(p.product_id));
            const existingProducts = await ProductModel.findAll({ where: { id: productIds } });
            if (existingProducts.length !== productIds.length) {
                res.status(200).json({ validation: "One or more products do not exist or are repeated" });
                return;
            }
            const validateExistingProductsOnOrders = await PurchaseOrderProductModel.findAll({
                where: {
                    purchase_order_id: purchase_order_id,
                    product_id: { [Op.in]: productIds }
                }
            });
            if (validateExistingProductsOnOrders.length > 0) {
                res.status(200).json({ validation: "One or more products already exists on Purcharsed order" });
                return;
            }
            const productToAdd = existingProducts.map(ep => ep.toJSON());
            const newProductsToOrders = products.map((value) => {
                const product = productToAdd.find((product) => {
                    if (Number(product.id) === Number(value.product_id)) return product;
                });
                if (product) {
                    value["purchase_order_id"] = Number(purchase_order_id);
                    value["recorded_price"] = Number(product.sale_price);
                    value["product_name"] = product.name;
                    return value;
                }
            });
            const validationPromises = newProductsToOrders.map(async (value) => {
                const validate = await validateSafeParseAsync(value);
                if (!validate.success) {
                    return { success: false, zod_errors: validate.error.errors };
                }
                return { success: true };
            });
            const validationResults = await Promise.all(validationPromises);
            for (const result of validationResults) {
                if (!result.success) {
                    res.status(200).json({ zod_validation: result.zod_errors });
                    return;
                }
            }
            const response = await PurchaseOrderProductModel.bulkCreate(newProductsToOrders);
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Products could not be added to the Purchased Order" });
                return;
            }
            res.status(201).json({ message: "Products successfully added to the Purchased Order" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;

        try {
            const existingRelation = await PurchaseOrderProductModel.findByPk(id);
            if (!existingRelation) {
                res.status(404).json({
                    validation: "PurchasedOrder-Product relationship not found for update"
                });
                return;
            }

            const relationship = existingRelation.toJSON();
            const editableFields = PurchaseOrderProductModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);

            let updatedProduct: any = null;

            if (update_values?.product_id || update_values?.purchase_order_id) {
                const [purchaseOrder, product] = await Promise.all([
                    update_values?.purchase_order_id
                        ? PurchasedOrderModel.findByPk(update_values.purchase_order_id)
                        : null,
                    update_values?.product_id
                        ? ProductModel.findByPk(update_values.product_id)
                        : null
                ]);

                if (update_values?.purchase_order_id && !purchaseOrder) {
                    res.status(404).json({
                        validation: "The assigned purchase order does not exist"
                    });
                    return;
                }

                if (update_values?.product_id && !product) {
                    res.status(404).json({
                        validation: "The assigned product does not exist"
                    });
                    return;
                }

                updatedProduct = product ? product.toJSON() : null;
            }

            const existingDuplicate = await PurchaseOrderProductModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            purchase_order_id: update_values.purchase_order_id
                                ?? relationship.purchase_order_id
                        },
                        {
                            product_id: update_values.product_id
                                ?? relationship.product_id
                        },
                        {
                            id: { [Op.ne]: id }
                        }
                    ]
                }
            });

            if (existingDuplicate) {
                res.status(409).json({
                    validation:
                        "PurchasedOrder-Product relationship already exists"
                });
                return;
            }

            const props_products = updatedProduct
                ? {
                    recorded_price: updatedProduct.sale_price,
                    product_name: updatedProduct.name
                }
                : {};

            const [affectedRows] =
                await PurchaseOrderProductModel.update(
                    { ...update_values, ...props_products },
                    { where: { id } }
                );

            if (affectedRows === 0) {
                res.status(200).json({
                    validation:
                        "No changes were made to the"
                        + " PurchasedOrder-Product relationship"
                });
                return;
            }

            res.status(200).json({
                message:
                    "PurchasedOrder-Product relationship"
                    + " updated successfully"
            });

        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
    static deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validatePurchaseOrderProduct = await PurchaseOrderProductModel.findOne({ where: { id: id } });
            if (!validatePurchaseOrderProduct) {
                res.status(200).json({ validation: "PurchasedOrder-Product relationship no found for delete" });
                return;
            }
            const purchase_order_id = validatePurchaseOrderProduct.toJSON().purchase_order_id;
            const response = await PurchaseOrderProductModel.destroy({ where: { id: id } });
            if (!(response > 0)) {
                res.status(200).json({ validation: "PurchasedOrder-Product relationship no found for delete" });
                return;
            }
            res.status(200).json({ message: "PurchasedOrder-Producto relationship deleted successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}
export default PurchaseOrderProductController;