import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { ProductModel, InputModel, ProductInputModel }
    from "../../../associations.js";
import { Request, Response, NextFunction }
    from "express";
import { Op } from "sequelize";

class ProductInputController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await ProductInputModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "Product-Input relationships no found"
                });
                return;
            }
            const relationships = response.map(pi => pi.toJSON());
            res.status(200).json(relationships);
        } catch (error: unknown) {
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
            const response = await ProductInputModel.findByPk(id);
            if (!response) {
                res.status(200).json({
                    validation: "Product-Input relationship no found"
                });
                return;
            }
            const relationship = response?.toJSON();
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { product_id, input_id, equivalence } = req.body;
        try {
            const [validateProduct, validateInput] = await Promise.all([
                ProductModel.findByPk(product_id),
                InputModel.findByPk(input_id)
            ]);

            if (!validateProduct) {
                res.status(404).json({
                    validation: "The assigned product does not exist"
                });
                return;
            }
            if (!validateInput) {
                res.status(404).json({
                    validation: "The assigned input does not exist"
                });
                return;
            }
            const validationDuplicate = await ProductInputModel.findOne({
                where: {
                    [Op.and]: [
                        { product_id: product_id },
                        { input_id: input_id }
                    ]
                }
            });
            if (validationDuplicate) {
                res.status(409).json({
                    validation: "Product-input relationship already exists"
                });
                return;
            }
            const response = await ProductInputModel.create({
                product_id,
                input_id,
                equivalence
            });
            if (!response) {
                res.status(400).json({
                    validation:
                        "The product-input relationship could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Product-input relationship created successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validateRelationship = await ProductInputModel.findByPk(id);
            if (!validateRelationship) {
                res.status(404).json({
                    validation:
                        "Product-input relationship no found for update"
                });
                return;
            }
            const relationship = validateRelationship?.toJSON();
            const editableFields = ProductInputModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "No validated properties were found for updating" +
                        "the input assignment to the product"
                });
                return;
            }

            if (update_values?.product_id || update_values?.input_id) {
                const [validateProduct, validateInput] = await Promise.all([
                    update_values?.product_id
                        ? ProductModel.findByPk(update_values.product_id)
                        : null,
                    update_values?.input_id
                        ? InputModel.findByPk(update_values.input_id)
                        : null
                ]);
                if (update_values?.product_id && !validateProduct) {
                    res.status(404).json({
                        validation: "The assigned product does not exist"
                    });
                    return;
                }
                if (update_values?.input_id && !validateInput) {
                    res.status(404).json({
                        validation: "The assigned input does not exist"
                    });
                    return;
                }
            }

            const validateDuplicate = await ProductInputModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            product_id:
                                update_values.product_id
                                || relationship.product_id
                        },
                        {
                            input_id:
                                update_values.input_id
                                || relationship.input_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            })
            if (validateDuplicate) {
                res.status(409).json({
                    validation:
                        "Product-Input relationshio already exists"
                });
                return;
            }

            const response = await ProductInputModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation:
                        "No changes were made to the process assignment to the product"
                })
                return;
            }
            res.status(200).json({
                message:
                    "Product-input relationship updated succefally"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await ProductInputModel.destroy({ where: { id: id }, individualHooks: true });
            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "Products-input relationship no found for delete"
                });
                return;
            }
            res.status(200).json({
                message:
                    "Product-Input relationship deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
}
export default ProductInputController;