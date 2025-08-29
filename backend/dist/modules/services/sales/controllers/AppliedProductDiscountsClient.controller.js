import collectorUpdateFields from "./../../../../scripts/collectorUpdateField.js";
import { AppliedProductDiscountClientModel, ProductDiscountClientModel, PurchasedOrderModel, PurchaseOrderProductModel } from "../../../associations.js";
import { Op } from "sequelize";
class AppliedProductDiscountClientController {
    static getAll = async (req, res, next) => {
        try {
            const response = await AppliedProductDiscountClientModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "No applied product discounts client found"
                });
                return;
            }
            const client_discounts = response.map(cd => cd.toJSON());
            res.status(200).json(client_discounts);
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
            const response = await AppliedProductDiscountClientModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "No product discounts client found" });
                return;
            }
            const client_discount = response.toJSON();
            res.status(200).json(client_discount);
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
        const { purchase_order_product_id, product_discount_client_id } = req.body;
        try {
            const [validatePurchaseOrderProduct, validateProductDiscountClient] = await Promise.all([
                PurchaseOrderProductModel.findByPk(purchase_order_product_id),
                ProductDiscountClientModel.findByPk(product_discount_client_id)
            ]);
            if (!validatePurchaseOrderProduct) {
                res.status(200).json({ validation: "The purchase order product does not exist" });
                return;
            }
            if (!validateProductDiscountClient) {
                res.status(200).json({ validacion: "The product discount client does not exist" });
                return;
            }
            const productDiscountClient = validateProductDiscountClient.toJSON();
            const purchase_order_product = validatePurchaseOrderProduct.toJSON();
            const validatePurchaseOrder = await PurchasedOrderModel.findOne({
                where: { id: purchase_order_product.purchase_order_id }
            });
            if (!validatePurchaseOrder) {
                res.status(200).json({ validation: "The purchased order does not exist" });
                return;
            }
            const purchase_order = validatePurchaseOrder.toJSON();
            if (productDiscountClient.client_id !== purchase_order.client_id) {
                res.status(200).json({
                    validation: "The product discount does not belong to the client"
                });
                return;
            }
            const validateExistingPOAppliedClientDiscount = await AppliedProductDiscountClientModel.findOne({
                where: { purchase_order_product_id: purchase_order_product_id }
            });
            if (validateExistingPOAppliedClientDiscount) {
                res.status(200).json({
                    validation: "The purchase order product already has an applied product discount client"
                });
                return;
            }
            const client_discount = validateProductDiscountClient.toJSON();
            const response = await AppliedProductDiscountClientModel.create({
                purchase_order_product_id: purchase_order_product_id,
                product_discount_client_id: product_discount_client_id,
                discount_percentage: client_discount.discount_percentage,
            });
            if (!response) {
                res.status(200).json({
                    validation: "The applied product discount client could not be created"
                });
                return;
            }
            res.status(200).json({
                message: "The applied product discount client was created succesfully"
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
            const validateExistingPOAppliedClientDiscount = await AppliedProductDiscountClientModel.findByPk(id);
            if (!validateExistingPOAppliedClientDiscount) {
                res.status(200).json({
                    validation: "The applied product discount client does not exist"
                });
                return;
            }
            const relationship = validateExistingPOAppliedClientDiscount.toJSON();
            const editableFields = AppliedProductDiscountClientModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation: "There are no validated applied product discount "
                        + "client properties for the update"
                });
                return;
            }
            if (update_values?.product_discount_client_id
                || update_values?.purchase_order_product_id) {
                const [validateProductDiscountClient, validatePurchaseOrderProduct] = await Promise.all([
                    update_values?.product_discount_client_id ?
                        ProductDiscountClientModel.findByPk(update_values.product_discount_client_id)
                        : null,
                    update_values?.purchase_order_product_id ?
                        PurchaseOrderProductModel.findByPk(update_values.purchase_order_product_id)
                        : null
                ]);
                if (update_values?.product_discount_client_id && !validateProductDiscountClient) {
                    res.status(200).json({ validation: "The product discount client does not exist" });
                    return;
                }
                if (update_values?.purchase_order_product_id && !validatePurchaseOrderProduct) {
                    res.status(200).json({ validation: "The purchase order product does not exist" });
                    return;
                }
            }
            const validateDuplicate = await AppliedProductDiscountClientModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            purchase_order_product_id: update_values.purchase_order_product_id
                                || relationship.purchase_order_product_id
                        },
                        {
                            product_discount_client_id: update_values.product_discount_client_id
                                || relationship.product_discount_client_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateDuplicate) {
                res.status(200).json({
                    validation: "The applied product discount client already exists"
                });
                return;
            }
            const response = await AppliedProductDiscountClientModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the applied product discount client"
                });
                return;
            }
            res.status(200).json({
                message: "The applied product discount client was updated successfully"
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
            const response = await AppliedProductDiscountClientModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "The applied product discount client not found for delete" });
                return;
            }
            res.status(200).json({ message: "The applied product discount client was deleted successfully" });
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
export default AppliedProductDiscountClientController;
