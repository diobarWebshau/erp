import {
    LocationsProductionLinesModel, ProductModel,
    ProductionLineModel, ProductionLineProductModel
} from "../../../associations.js";
import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    Request, Response, NextFunction
} from "express";
import {
    Op
} from "sequelize";

class ProductionLineProductController {

    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response =
                await ProductionLineProductModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation:
                        "Production-Lines-Products "
                        + "relationship no found"
                });
                return;
            }
            const relationships = response.map(lp => lp.toJSON());
            res.status(200).json(relationships);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }

    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await
                ProductionLineProductModel.findByPk(id);
            if (!response) {
                res.status(200).json({
                    validation:
                        "Production-Lines-Products relationship no found"
                });
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { production_line_id, product_id } = req.body;
        try {

            const [validateProductionLine, validateProduct] = await
                Promise.all([
                    ProductionLineModel.findByPk(production_line_id),
                    ProductModel.findByPk(product_id)
                ]);
            if (!validateProductionLine) {
                res.status(404).json({
                    validation:
                        "The assigned production line does not exist"
                });
                return;
            }
            if (!validateProduct) {
                res.status(404).json({
                    validation:
                        "The assigned product does not exist"
                });
                return;
            }
            const validationDuplicate =
                await ProductionLineProductModel.findOne({
                    where: {
                        [Op.and]: [
                            { production_line_id: production_line_id },
                            { product_id: product_id }
                        ]
                    }
                });
            if (validationDuplicate) {
                res.status(200).json({
                    validation:
                        "Production-Lines-Products relationship"
                        + " already exists"
                });
                return;
            }
            const response = await ProductionLineProductModel.create({
                production_line_id,
                product_id
            });
            if (!response) {
                res.status(400).json({
                    validation:
                        "The product assigned to the production line"
                        + " could not be created"
                });
                return;
            }
            res.status(201).json({
                message:
                    "Production-Lines-Products relationship created"
                    + " successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validateRelationship =
                await ProductionLineProductModel.findOne({
                    where: { id: id }
                })
            if (!validateRelationship) {
                res.status(200).json({
                    validation:
                        "Production-Lines-Products no found for update"
                });
                return;
            }
            const relationship =
                validateRelationship?.toJSON();
            const editableFields =
                ProductionLineProductModel.getEditableFields();
            const update_values =
                collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "No validated properties were found for updating"
                        + "the type assignment to the location"
                });
                return;
            }

            if (update_values?.production_line_id
                || update_values?.product_id) {
                const [validateProductionLine, validateProduct] =
                    await Promise.all([
                        update_values?.production_line_id
                            ? ProductionLineModel.findByPk(
                                update_values?.production_line_id)
                            : Promise.resolve(null),
                        update_values?.product_id
                            ? ProductModel.findByPk(
                                update_values?.product_id)
                            : Promise.resolve(null)
                    ]);
                if (update_values?.production_line_id
                    && !validateProductionLine) {
                    res.status(404).json({
                        validation:
                            "The assigned production-line "
                            + "does not exist"
                    });
                    return;
                }
                if (update_values?.product_id
                    && !validateProduct) {
                    res.status(404).json({
                        validation:
                            "The assigned product does not exist"
                    });
                    return;
                }
            }

            const validateDuplicate = await
                ProductionLineProductModel.findOne({
                    where: {
                        [Op.and]: [
                            {
                                production_line_id:
                                    update_values?.production_line_id
                                    || relationship?.production_line_id
                            },
                            {
                                product_id:
                                    update_values?.product_id
                                    || relationship?.product_id
                            },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });

            if (validateDuplicate) {
                res.status(409).json({
                    validation:
                        "The assigned product to the production line"
                        + " already exists"
                });
                return;
            }

            const response = await ProductionLineProductModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation:
                        "ProductionLine-product relationship"
                        + " no found or no changes were made"
                })
                return;
            }
            res.status(200).json({
                message:
                    "ProductionLine-product relationship "
                    + "updated succefally"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
    static deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await
                ProductionLineProductModel.destroy({
                    where: { id: id }, individualHooks: true
                });
            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "Production-Lines-Products relationship"
                        + " no found for delete"
                });
                return;
            }
            res.status(200).json({
                message:
                    "ProductionLine-Products relationship"
                    + " deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
}

export default ProductionLineProductController;