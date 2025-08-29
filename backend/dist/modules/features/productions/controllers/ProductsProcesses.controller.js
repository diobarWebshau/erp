import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { ProductModel, ProcessModel, ProductProcessModel } from "../../../associations.js";
import { Op } from "sequelize";
class ProductsProcessesController {
    static getAll = async (req, res, next) => {
        try {
            const response = await ProductProcessModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "Product-process relationships no found"
                });
                return;
            }
            const relationships = response.map(pi => pi.toJSON());
            res.status(200).json(relationships);
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
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ProductProcessModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({
                    validation: "Product-process relationship no found"
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
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { product_id, process_id, sort_order } = req.body;
        try {
            const validateProduct = await ProductModel.findByPk(product_id);
            if (!validateProduct) {
                res.status(200).json({
                    validation: "The assigned product does not exist"
                });
                return;
            }
            const validateProcess = await ProcessModel.findByPk(process_id);
            if (!validateProcess) {
                res.status(200).json({
                    validation: "The assigned process does not exist"
                });
                return;
            }
            const validation = await ProductProcessModel.findOne({
                where: {
                    [Op.and]: [
                        { product_id: product_id },
                        { process_id: process_id }
                    ]
                }
            });
            if (validation) {
                res.status(200).json({
                    validation: "Product-process relationship already exists"
                });
                return;
            }
            console.log("entro");
            const response = await ProductProcessModel.create({
                product_id, process_id, sort_order
            });
            console.log("salgo");
            if (!response) {
                res.status(200).json({
                    validation: "The product-process relationship could not be created"
                });
                return;
            }
            res.status(200).json({
                message: "Product-process relationship created successfully"
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
            const validateRelationship = await ProductProcessModel.findByPk(id);
            if (!validateRelationship) {
                res.status(200).json({
                    validation: "Product-process relationship no found for update"
                });
                return;
            }
            const relationship = validateRelationship.toJSON();
            const editableFields = ProductProcessModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "No validated properties were found for updating" +
                        "the process assignment to the product"
                });
                return;
            }
            if (update_values?.product_id || update_values?.process_id) {
                const [validateProduct, validateProcess] = await Promise.all([
                    update_values?.update_values.product_id
                        ? ProductModel.findByPk(update_values.product_id)
                        : null,
                    update_values?.update_values.process_id
                        ? ProcessModel.findByPk(update_values.process_id)
                        : null
                ]);
                if (update_values?.product_id && !validateProduct) {
                    res.status(200).json({
                        validation: "The assigned product does not exist"
                    });
                    return;
                }
                if (update_values?.process_id && !validateProcess) {
                    res.status(200).json({
                        validation: "The assigned process does not exist"
                    });
                    return;
                }
            }
            const validateDuplicate = await ProductProcessModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            product_id: update_values.product_id
                                || relationship.product_id
                        },
                        {
                            process_id: update_values.process_id
                                || relationship.process_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateDuplicate) {
                res.status(200).json({
                    validation: "The product-process relationship already exists"
                });
                return;
            }
            const response = await ProductProcessModel.update(update_values, { where: { id: id }, individualHooks: true });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the product-process relationship"
                });
                return;
            }
            res.status(200).json({
                message: "Product-process relationship updated succefally"
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
    static deleteById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ProductProcessModel.destroy({ where: { id: id }, individualHooks: true });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "Products-process relationship no found for delete"
                });
                return;
            }
            res.status(200).json({
                message: "Product-process relationship deleted successfully"
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
export default ProductsProcessesController;
