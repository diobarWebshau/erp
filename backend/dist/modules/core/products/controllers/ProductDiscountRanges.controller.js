import { ProductDiscountRangeModel, ProductModel } from "../../../associations.js";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { Op } from "sequelize";
class ProductDiscountRangesController {
    static getAll = async (req, res, next) => {
        try {
            const response = await ProductDiscountRangeModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "Product discount ranges no found"
                });
                return;
            }
            const productDiscountRanges = response.map(cd => cd.toJSON());
            res.status(200).json(productDiscountRanges);
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
            const response = await ProductDiscountRangeModel.findByPk(id);
            if (!response) {
                res.status(200).json({
                    validation: "Product discount ranges no found"
                });
                return;
            }
            const productDiscountRanges = response.toJSON();
            res.status(200).json(productDiscountRanges);
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
        const { product_id, unit_price, min_qty, max_qty } = req.body;
        try {
            const validatedproduct = await ProductModel.findByPk(product_id);
            if (!validatedproduct) {
                res.status(200).json({
                    validation: "The product assiged to the discount range does not exist"
                });
                return;
            }
            const validateRangeDiscount = await ProductDiscountRangeModel.findAll({
                where: { product_id: product_id }
            });
            if (validateRangeDiscount.length > 0) {
                const rangeDiscount = validateRangeDiscount.map(rd => rd.toJSON());
                const NoduplicatedRange = rangeDiscount.every((element, index) => {
                    const min_qty_aux = element.min_qty;
                    const max_qty_aux = element.max_qty;
                    return (
                    // Verifica que no se solapen
                    (min_qty >= max_qty_aux || max_qty <= min_qty_aux) &&
                        // Verifica que no sean exactamente iguales
                        !(min_qty === min_qty_aux && max_qty === max_qty_aux));
                });
                if (!NoduplicatedRange) {
                    res.status(200).json({
                        validation: "The discount range already exists or overlaps with another "
                            + "discount for the same product. Please ensure the ranges "
                            + "are unique and do not overlap"
                    });
                    return;
                }
            }
            const response = await ProductDiscountRangeModel.create({
                product_id,
                unit_price,
                min_qty,
                max_qty
            });
            if (!response) {
                res.status(200).json({
                    validation: "Could not create a discount range for the product"
                });
            }
            res.status(200).json({
                message: "Discount range created successfully for the product"
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
            const editableFields = ProductDiscountRangeModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "There are no validated product discount " +
                        "ranges properties for the update."
                });
                return;
            }
            const validateProductDiscount = await ProductDiscountRangeModel.findByPk(id);
            if (!validateProductDiscount) {
                res.status(200).json({
                    validation: "Product discount ranges not found"
                });
                return;
            }
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation: "There are no validated product discount ranges properties "
                        + "for the update"
                });
                return;
            }
            if (update_values?.product_id) {
                const validateproduct = await ProductModel.findByPk(update_values.product_id);
                if (!validateproduct) {
                    res.status(200).json({
                        validation: "The product assigned to the discount range "
                            + "does not exist"
                    });
                    return;
                }
            }
            const validateRangeDiscount = await ProductDiscountRangeModel.findAll({
                where: {
                    [Op.and]: [
                        { product_id: update_values.product_id },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateRangeDiscount.length > 0) {
                const rangeDiscount = validateRangeDiscount.map(rd => rd.toJSON());
                const NoduplicatedRange = rangeDiscount.every((element, index) => {
                    const min_qty_aux = element.min_qty;
                    const max_qty_aux = element.max_qty;
                    return ((update_values.min_qty >= max_qty_aux ||
                        update_values.max_qty <= min_qty_aux) &&
                        !(update_values.min_qty === min_qty_aux &&
                            update_values.max_qty === max_qty_aux));
                });
                if (!NoduplicatedRange) {
                    res.status(200).json({
                        validation: "The discount range already exists or overlaps with "
                            + "another discount for the same product. Please "
                            + "ensure the ranges are unique and do not overlap"
                    });
                    return;
                }
            }
            const response = await ProductDiscountRangeModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No product discount ranges found to update or not "
                        + "changes were made"
                });
                return;
            }
            res.status(200).json({
                message: "Product discount ranges updated successfully"
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
            const response = await ProductDiscountRangeModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "No product discount ranges found to delete"
                });
                return;
            }
            res.status(200).json({
                message: "Product discount ranges deleted successfully"
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
export default ProductDiscountRangesController;
