import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { AppliedProductDiscountRangeModel, ProductDiscountRangeModel, PurchaseOrderProductModel } from "../../../associations.js";
import { Op } from "sequelize";
class AppliedProductDiscountsRangesController {
    static getAll = async (req, res, next) => {
        try {
            const response = await AppliedProductDiscountRangeModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Applied product discounts ranges no found" });
                return;
            }
            const appliedProductDiscounts = response.map(apd => apd.toJSON());
            res.status(200).json(appliedProductDiscounts);
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
            const response = await AppliedProductDiscountRangeModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "Applied product discount ranges not found" });
                return;
            }
            const appliedProductDiscount = response.toJSON();
            res.status(200).json(appliedProductDiscount);
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
        const { purchase_order_product_id, product_discount_range_id } = req.body;
        try {
            const [validatePurchaseOrder, validateProductDiscount] = await Promise.all([
                PurchaseOrderProductModel.findByPk(purchase_order_product_id),
                ProductDiscountRangeModel.findByPk(product_discount_range_id)
            ]);
            if (!validatePurchaseOrder) {
                res.status(200).json({ validation: "Purchase order product not found" });
                return;
            }
            if (!validateProductDiscount) {
                res.status(200).json({ validation: "The product discount does not exist" });
                return;
            }
            const props_product_discount = validateProductDiscount.toJSON();
            const validateExistsPurchaseOrderProductWithDiscount = await AppliedProductDiscountRangeModel.findOne({
                where: { purchase_order_product_id: purchase_order_product_id }
            });
            if (validateExistsPurchaseOrderProductWithDiscount) {
                res.status(200).json({
                    validation: "The purchase order product already has a discount applied"
                });
                return;
            }
            const validateAppliedProductDiscount = await AppliedProductDiscountRangeModel.findOne({
                where: {
                    [Op.and]: [
                        { purchase_order_product_id: purchase_order_product_id },
                        { product_discount_range_id: product_discount_range_id }
                    ]
                }
            });
            if (validateAppliedProductDiscount) {
                res.status(200).json({
                    validation: "The purchase order alreay has an applied client discount"
                });
                return;
            }
            const response = await AppliedProductDiscountRangeModel.create({
                purchase_order_product_id,
                product_discount_range_id,
                unit_discount: props_product_discount.unit_price,
                max_qty: props_product_discount.max_qty,
                min_qty: props_product_discount.min_qty
            });
            if (!response) {
                res.status(200).json({
                    validation: "The applied product discount could not be craeted"
                });
                return;
            }
            res.status(200).json({
                message: "Applied product discount created successfully"
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
            const validateExistingPOAppliedProductDiscount = await AppliedProductDiscountRangeModel.findByPk(id);
            if (!validateExistingPOAppliedProductDiscount) {
                res.status(200).json({
                    validation: "The applied product discount does not exist"
                });
                return;
            }
            const editableFields = AppliedProductDiscountRangeModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation: "There are no validated applied product "
                        + "discount properties for the update"
                });
                return;
            }
            const relationship = validateExistingPOAppliedProductDiscount.toJSON();
            if (update_values?.product_discount_range_id
                || update_values?.purchase_order_product_id) {
                const [validateProductDiscount, validatePurchaseOrderProduct] = await Promise.all([
                    update_values?.product_discount_range_id
                        ? ProductDiscountRangeModel.findByPk(update_values.product_discount_range_id)
                        : null,
                    update_values?.purchase_order_product_id
                        ? PurchaseOrderProductModel.findByPk(update_values.purchase_order_product_id)
                        : null
                ]);
                if (update_values?.product_discount_range_id && !validateProductDiscount) {
                    res.status(200).json({ validation: "The product discount does not exist" });
                    return;
                }
                if (update_values?.purchase_order_product_id && !validatePurchaseOrderProduct) {
                    res.status(200).json({ validation: "The purchase order product does not exist" });
                    return;
                }
            }
            const validateAppliedProductDiscount = await AppliedProductDiscountRangeModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            purchase_order_product_id: update_values.purchase_order_product_id
                                || relationship.purchase_order_product_id
                        },
                        {
                            product_discount_range_id: update_values.product_discount_range_id
                                || relationship.product_discount_range_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateAppliedProductDiscount) {
                res.status(200).json({
                    validation: "The applied product discount already exists"
                });
                return;
            }
            const response = await AppliedProductDiscountRangeModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the applied product discount"
                });
                return;
            }
            res.status(200).json({
                message: "The applied product discount was updated successfully"
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
            const response = await AppliedProductDiscountRangeModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "The applied product discount not found for delete" });
                return;
            }
            res.status(200).json({ message: "The applied product discount was deleted successfully" });
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
export default AppliedProductDiscountsRangesController;
