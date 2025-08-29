import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    ClientModel,
    ProductDiscountClientModel, ProductModel
} from "../../../associations.js";
import { NextFunction, Request, Response }
    from "express";
import { Op }
    from "sequelize";

class ProductDiscountsClientsController {
    static getAll =
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const response = await ProductDiscountClientModel.findAll();
                if (!(response.length > 0)) {
                    res.status(200).json({ validation: "Product discounts client no found" });
                    return;
                }
                const clientDiscounts = response.map(cd => cd.toJSON());
                res.status(200).json(clientDiscounts);
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
            const response = await ProductDiscountClientModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "No client discount found" });
                return;
            }
            const clientDiscount = response.toJSON();
            res.status(200).json(clientDiscount);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { client_id, product_id, discount_percentage } = req.body;
        try {

            const [validatedClient, validatedProduct] = await Promise.all([
                ClientModel.findByPk(client_id),
                ProductModel.findByPk(product_id)
            ]);

            if (!validatedClient) {
                res.status(404).json({
                    validation:
                        "The client assigned to the discount does not exist"
                });
                return;
            }
            if (!validatedProduct) {
                res.status(404).json({
                    validation:
                        "The product assigned to the discount does not exist"
                });
                return;
            }
            const validateDuplicateDiscount = await ProductDiscountClientModel.findOne({
                where: {
                    [Op.and]: [
                        { client_id: client_id },
                        { product_id: product_id }
                    ]
                }
            });
            if (validateDuplicateDiscount) {
                res.status(409).json({
                    validation:
                        "The discount percentage is already defined for "
                        + "the client for this product"
                });
                return;
            }
            const response = await ProductDiscountClientModel.create({
                client_id,
                product_id,
                discount_percentage
            })
            if (!response) {
                res.status(400).json({
                    validation: "Could not create a discount product for the client"
                });
            }
            res.status(200).json({
                message: "Discount product created successfully for the client"
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
            const productDiscountClient = await ProductDiscountClientModel.findByPk(id);
            if (!productDiscountClient) {
                res.status(404).json({
                    validation:
                        "Product discount client not found for update"
                });
                return;
            }

            const relationship = productDiscountClient.toJSON();
            const editableFields = ProductDiscountClientModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);

            if (Object.keys(update_values).length === 0) {
                res.status(404).json({
                    validation:
                        "There are no validated client discount properties for the update"
                });
                return;
            }

            if (update_values.client_id || update_values.product_id) {
                const [validateClient, validateProduct] = await Promise.all([
                    update_values.client_id
                        ? ClientModel.findByPk(update_values.client_id)
                        : null,
                    update_values.product_id
                        ? ProductModel.findByPk(update_values.product_id)
                        : null
                ]);

                if (update_values.client_id && !validateClient) {
                    res.status(404).json({
                        validation: "The client assigned to the discount does not exist"
                    });
                    return;
                }

                if (update_values.product_id && !validateProduct) {
                    res.status(404).json({
                        validation: "The product assigned to the discount does not exist"
                    });
                    return;
                }
            }
            const clientIdToCheck = update_values.client_id ?? relationship.client_id;
            const productIdToCheck = update_values.product_id ?? relationship.product_id;
            const discountToCheck = update_values.discount_percentage;
            if (discountToCheck) {
                const duplicateDiscounts = await ProductDiscountClientModel.findAll({
                    where: {
                        [Op.and]: [
                            { client_id: clientIdToCheck },
                            { product_id: productIdToCheck },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                const discounts = duplicateDiscounts.map(d => d.toJSON());
                const existsSameDiscount = discounts.some(dp =>
                    Number(dp.discount_percentage) === Number(discountToCheck)
                );

                if (existsSameDiscount) {
                    res.status(400).json({
                        validation:
                            "The discount percentages are already defined in another "
                            + "client discount for the same client"
                    });
                    return;
                }
            }
            const [affectedRows] = await ProductDiscountClientModel.update(
                update_values,
                { where: { id }, individualHooks: true }
            );
            if (affectedRows === 0) {
                res.status(200).json({
                    validation:
                        "No changes were made to the product discount client"
                });
                return;
            }
            res.status(200).json({ message: "Discount updated successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const id_number = Number(id);
        try {
            const response = await ProductDiscountClientModel.destroy({
                where: { id: id_number }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "No client discount found to delete" });
                return;
            }
            res.status(200).json({ message: "Client discount deleted successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
}
export default ProductDiscountsClientsController;