import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    ProductionLineModel,
    ProductModel,
    ProductionLineProductModel,
    LocationsProductionLinesModel,
    LocationModel,
    ProductionLineQueueModel,
    ProductionOrderModel,
    ProductionModel,
    ProductProcessModel,
    ProcessModel
} from "../../../associations.js";
import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    Op, QueryTypes, Transaction
} from "sequelize";
import sequelize from "../../../../mysql/configSequelize.js";
import {
    LocationsProductionLinesCreateAttributes,
    ProductionLineProductAttributes,
    ProductionLineProductCreateAttributes
} from "../../../types.js";
import {
    formatImagesDeepRecursive
} from "../../../../scripts/formatWithBase64.js";
import {
    ProductionLineProductManager
} from "../models/junctions/production_lines-products.model.js";

interface PendingProductionSummaryResponse {
    summary_production: PendingProductionSummary;
}

interface PendingProductionSummary {
    internal_production: number;
    client_production: number;
}

class ProductionLinesController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await ProductionLineModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validaton: "Production lines no found" })
                return;
            }
            const productionLines = response.map(pl => pl.toJSON());
            res.status(200).json(productionLines);
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
            const response = await ProductionLineModel.findByPk(id, {
                attributes: ProductionLineModel.getAllFields(),
                include: [
                    {
                        model: ProductionLineQueueModel,
                        as: "production_line_queue",
                        required: false,
                        attributes: ProductionLineQueueModel.getAllFields(),
                        separate: true, // 👈 esto permite que order funcione dentro del include
                        order: [["position", "ASC"]],
                        include: [
                            {
                                model: ProductionOrderModel,
                                as: "production_order",
                                required: false,
                                attributes: [
                                    ...ProductionOrderModel.getAllFields(),
                                    [
                                        sequelize.fn(
                                            "func_get_order_of_production_order",
                                            sequelize.col("production_order.id"),       // ✅ usa alias local
                                            sequelize.col("production_order.order_id"), // ✅ usa alias local
                                            sequelize.col("production_order.order_type")
                                        ),
                                        "order"
                                    ]
                                ],
                                include: [
                                    {
                                        model: ProductionModel,
                                        as: "productions",
                                        required: false,
                                        attributes: ProductionModel.getAllFields(),
                                    },
                                    {
                                        model: ProductModel,
                                        as: "product",
                                        required: false,
                                        attributes: ProductModel.getAllFields(),
                                        include: [
                                            {
                                                model: ProductProcessModel,
                                                as: "product_processes",
                                                required: false,
                                                attributes: ProductProcessModel.getAllFields(),
                                                include: [
                                                    {
                                                        model: ProcessModel,
                                                        as: "process",
                                                        required: false,
                                                        attributes: ProcessModel.getAllFields()
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        model: ProductionLineProductModel,
                        as: "production_lines_products",
                        required: false,
                        attributes: ProductionLineProductModel.getAllFields(),
                        include: [
                            {
                                model: ProductModel,
                                as: "products",
                                required: false,
                                attributes: ProductModel.getAllFields(),
                            }
                        ]
                    }
                ]
            });
            if (!response) {
                res.status(200).json({ validation: "Produnction line no found" });
                return;
            }
            const productionLines = response.toJSON();
            res.status(200).json(productionLines);
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }

    static getProductionLineDetails = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        try {
            const response: ProductionLineModel | null =
                await ProductionLineModel.findOne({
                    where: { id: id },
                    include: [
                        {
                            model: ProductionLineProductModel,
                            as: "production_lines_products",
                            attributes:
                                ProductionLineProductModel
                                    .getAllFields(),
                            include: [
                                {
                                    model: ProductModel,
                                    as: "products",
                                    attributes:
                                        ProductModel
                                            .getAllFields()
                                }
                            ]
                        },
                        {
                            model: LocationsProductionLinesModel,
                            as: "location_production_line",
                            attributes:
                                LocationsProductionLinesModel
                                    .getAllFields(),
                            include: [
                                {
                                    model: LocationModel,
                                    as: "location",
                                    attributes:
                                        LocationModel
                                            .getAllFields()
                                }
                            ]
                        }
                    ]
                });

            if (!response) {
                res.status(200).json(null);
                return;
            }
            const formattedResponse =
                await formatImagesDeepRecursive([response], ["photo", "path"]);

            res.status(200).json(formattedResponse[0]);
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }

    static getByName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        try {
            const response =
                await ProductionLineModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Produnction line no found" });
                return;
            }
            const productionLines = response.toJSON();
            res.status(200).json(productionLines);
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
        const { name } = req.body;
        try {
            const validation_name =
                await ProductionLineModel.findOne({ where: { name: name } });
            if (validation_name) {
                res.status(200).json({
                    validation: "The name is already used in a productionLine"
                });
                return;
            }
            const response = await ProductionLineModel.create({ name });
            if (!response) {
                res.status(200).json({
                    message: "The production line could not be created"
                });
                return;
            }
            res.status(200).json({
                message: "Production line created successfully"
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

    static createComplete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const {
            name, is_active,
            location_production_line,
            production_lines_products
        } = req.body;

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

        try {

            const validation_name =
                await ProductionLineModel.findOne({
                    where: { name: name }
                });


            if (validation_name) {
                await transaction.rollback();
                res.status(409).json({
                    validation:
                        `The name is already used in `
                        + `a production line`
                });
                return;
            }

            const response =
                await ProductionLineModel.create({
                    name,
                    is_active
                });

            if (!response) {
                await transaction.rollback();
                res.status(400).json({
                    message:
                        "The production line could not be created"
                });
                return;
            }

            const productionLine =
                await response.toJSON();


            if (location_production_line) {

                const locationProductionLineCreate = {
                    production_line_id: productionLine.id,
                    location_id: location_production_line?.location_id
                }

                const responseLocationProductionLine =
                    await LocationsProductionLinesModel.create(
                        locationProductionLineCreate,
                        { transaction }
                    );

                if (!responseLocationProductionLine) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            `The assigned production line to`
                            + ` location could not be created`
                    });
                    return;
                }
            }


            if (production_lines_products.length > 0) {
                const productsIds: number[] =
                    production_lines_products.map(
                        (p: ProductionLineProductCreateAttributes) =>
                            p.products?.id
                    );

                const responseValidationProducts: ProductModel[] =
                    await ProductModel.findAll({
                        where: {
                            id: productsIds
                        }
                    });

                if (responseValidationProducts.length
                    !== productsIds.length) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "Some products are not valid"
                    });
                    return;
                }

                const producctionLineProductsCreate =
                    production_lines_products.map((
                        p: ProductionLineProductCreateAttributes) => {
                        return {
                            production_line_id: productionLine.id,
                            product_id: p.products?.id
                        }
                    });

                const responseProductionLineProducts =
                    await ProductionLineProductModel
                        .bulkCreate(
                            producctionLineProductsCreate,
                            { transaction }
                        );


                if (responseProductionLineProducts.length
                    !== producctionLineProductsCreate.length) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "The production line products could not be created"
                    });
                    return;
                }

            }

            await transaction.commit();

            res.status(201).json({
                message:
                    "Production line created successfully"
            });

        } catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }

    static updateComplete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const { id } = req.params;

        const completeBody = req.body;

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

        try {

            const validateProductionLine =
                await ProductionLineModel
                    .findOne({ where: { id: id } });

            if (!validateProductionLine) {
                await transaction.rollback();
                res.status(404).json({
                    validation:
                        "Production line not found"
                });
                return;
            }

            const editableFields =
                ProductionLineModel.getEditableFields();
            const update_values =
                collectorUpdateFields(editableFields, completeBody);


            if (Object.keys(update_values).length > 0) {
                if (update_values?.name) {
                    const validateName =
                        await ProductionLineModel.findOne({
                            where: {
                                [Op.and]: [
                                    { name: update_values.name },
                                    { id: { [Op.ne]: id } }
                                ]
                            }
                        });
                    if (validateName) {
                        await transaction.rollback();
                        res.status(200).json({
                            validation:
                                `The name is already currently in `
                                + ` use by a production line`
                        });
                        return;
                    }
                }

                if (update_values?.is_active) {
                    update_values.is_active =
                        Boolean(update_values.is_active);
                }

                const responseProductionLine =
                    await ProductionLineModel.update(
                        update_values,
                        {
                            where: { id },
                            transaction: transaction
                        }
                    );

                if (!responseProductionLine) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "The production line could not be updated"
                    });
                    return;
                }
            }

            if (Object.keys(completeBody?.location_production_line).length > 0) {
                console.log("entro a location production line");
                const locationProductionLineUpdated:
                    LocationsProductionLinesCreateAttributes =
                    completeBody.location_production_line

                const responsePendingProductionSummary =
                    await sequelize.query(
                        `SELECT func_line_pending_production_summary(${id})`
                        + ` AS summary_production;`,
                        { type: QueryTypes.SELECT }
                    );

                const pendingProductionSummary =
                    responsePendingProductionSummary
                        .shift() as PendingProductionSummaryResponse;

                const summary =
                    pendingProductionSummary
                        .summary_production as PendingProductionSummary;

                console.log(summary);
                console.log(locationProductionLineUpdated);

                if (Number(summary.internal_production) > 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            `You cannot change the location of` +
                            ` this production line because it has ` +
                            `active internal production assigned`
                    });
                    return;
                }

                if (Number(summary.client_production) > 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            `You cannot change the location of` +
                            ` this production line because it has ` +
                            `active client production assigned`
                    });
                    return;
                }
                const responseDelete =
                    await LocationsProductionLinesModel.destroy({
                        where: { production_line_id: id },
                        transaction: transaction
                    });

                if (!responseDelete) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            `The production line location`
                            + ` could not be deleted`
                    });
                    return;
                }

                const locationProductionLineCreate:
                    LocationsProductionLinesCreateAttributes = {
                    production_line_id: Number(id),
                    location_id: locationProductionLineUpdated.location_id
                }

                const responseCreate =
                    await LocationsProductionLinesModel.create(
                        locationProductionLineCreate,
                        { transaction }
                    );

                if (!responseCreate) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            `The production line location`
                            + ` could not be created`
                    });
                    return;
                }
            }

            if (completeBody?.production_lines_products_updated) {

                const plpManager: ProductionLineProductManager =
                    completeBody
                        .production_lines_products_updated;

                const flagProductsInputsUpdate: boolean = [
                    plpManager.added,
                    plpManager.deleted,
                    plpManager.modified
                ].some((p) => p.length > 0);

                if (flagProductsInputsUpdate) {

                    const adds: ProductionLineProductCreateAttributes[] =
                        plpManager.added;
                    const deletes: ProductionLineProductAttributes[] =
                        plpManager.deleted;

                    if (deletes.length > 0) {
                        const deletesFiltered: ProductionLineProductAttributes[] =
                            deletes.filter(p => p.id !== undefined);

                        const existingProducts = await ProductionLineProductModel.findAll({
                            where: { id: { [Op.in]: deletesFiltered.map(d => d.id) } },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (existingProducts.length !== deletesFiltered.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation:
                                    `Some products you are trying`
                                    + ` to delete do not exist`,
                            });
                            return;
                        }

                        const responseDelete =
                            await ProductionLineProductModel.destroy({
                                where: { id: { [Op.in]: deletesFiltered.map(d => d.id) } },
                                transaction
                            });

                        if (!responseDelete) {
                            await transaction.rollback();
                            res.status(400).json({
                                validation:
                                    `The production line products`
                                    + ` could not be deleted`
                            });
                            return;
                        }

                    }

                    if (adds.length > 0) {
                        const addsFiltered: ProductionLineProductCreateAttributes[] =
                            adds.filter(p => p.product_id !== undefined);

                        const addIds: number[] = addsFiltered
                            .map(m => m.product_id as number);

                        const existingProducts: ProductModel[] =
                            await ProductModel.findAll({
                                where: { id: addIds },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (existingProducts.length !== addIds.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation:
                                    `Some products you are trying`
                                    + ` to add do not exist`,
                            });
                            return;
                        }

                        const conflictingProducts =
                            await ProductionLineProductModel.findAll({
                                where: {
                                    [Op.and]: [
                                        { production_line_id: id },
                                        { product_id: { [Op.in]: addIds } }
                                    ],
                                },
                                transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (conflictingProducts.length > 0) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation:
                                    `Some products you are trying`
                                    + ` to add already exist in `
                                    + `this production line`,
                            });
                            return;
                        }

                        const newAdds: ProductionLineProductCreateAttributes[] =
                            addsFiltered.map(a => ({
                                production_line_id: Number(id),
                                product_id: a.product_id
                            }));

                        const responseAdd =
                            await ProductionLineProductModel.bulkCreate(
                                newAdds, { transaction }
                            );

                        if (!responseAdd) {
                            await transaction.rollback();
                            res.status(400).json({
                                validation:
                                    `The production line products`
                                    + ` could not be created`
                            });
                            return;
                        }
                    }
                }
            }

            await transaction.commit();

            res.status(201).json({
                message:
                    "Production line created successfully"
            });
        } catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }

    }

    static update = async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const { name } = req.body;
        const { id } = req.params;
        try {
            const editableFields =
                ProductionLineModel.getEditableFields();
            const update_values =
                collectorUpdateFields(editableFields, body);
            const validateProductionLine =
                await ProductionLineModel.findOne({ where: { id: id } });
            if (!validateProductionLine) {
                res.status(200).json({
                    validation: "Production line not found"
                });
                return;
            }
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation:
                        "There are no validated role properties for the update"
                });
                return;
            }
            if (update_values?.name) {
                const validateName = await ProductionLineModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: name },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    res.status(200).json({
                        validation:
                            "The name is already used in a production line"
                    });
                    return;
                }
            }
            const response = await ProductionLineModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation:
                        "No changes were made to the permission"
                });
                return;
            }
            res.status(200).json({
                message:
                    "Production line updated successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {

            const responsePendingProductionSummary =
                await sequelize.query(
                    `SELECT func_line_pending_production_summary(${id})`
                    + ` AS summary_production;`,
                    { type: QueryTypes.SELECT }
                );

            const pendingProductionSummary =
                responsePendingProductionSummary
                    .shift() as PendingProductionSummaryResponse;

            const summary =
                pendingProductionSummary
                    .summary_production as PendingProductionSummary;

            if (Number(summary.internal_production) > 0) {
                res.status(400).json({
                    validation:
                        "You cannot delete this production line " +
                        "because it has active internal production assigned"
                });
                return;
            }

            if (Number(summary.client_production) > 0) {
                res.status(400).json({
                    validation:
                        "You cannot delete this production line " +
                        "because it has active client production assigned"
                });
                return;
            }

            const response =
                await ProductionLineModel.destroy({ where: { id: id }, individualHooks: true });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "Production line no found for deleted"
                });
                return;
            }
            res.status(200).json({
                message: "Production line deleted successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    }
    static getProductsOnProductionLine = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const productionLine = await ProductionLineModel.findByPk(id);
            if (!productionLine) {
                res.status(200).json({
                    validation: "Production line not found"
                });
                return;
            }
            const response = await ProductionLineModel.findOne({
                where: { id },
                include: [{
                    model: ProductionLineProductModel,
                    as: "production_lines_products",
                    attributes: ProductionLineProductModel.getAllFields(),
                    include: [{
                        model: ProductModel,
                        as: "products",
                        attributes: ProductModel.getAllFields()
                    }]
                }]
            });

            if (!response) {
                res.status(200).json({
                    validation:
                        "No products found on the production line"
                });
                return;
            }
            const productsOfLine = response.toJSON();
            res.status(200).json(productsOfLine);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred ${error}`);
            }
        }
    }
    static addProduct = async (req: Request, res: Response, next: NextFunction) => {
        let { id } = req.params;
        const { product_id } = req.body;
        try {
            const validateProductionLine = await ProductionLineModel.findOne({
                where: { id: id }
            });
            if (!validateProductionLine) {
                res.status(200).json({
                    validation: "Production line not found"
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

            const validation = await ProductionLineProductModel.findOne({
                where: {
                    [Op.and]: [
                        { production_line_id: id },
                        { product_id: product_id }
                    ]
                }
            });
            if (validation) {
                res.status(200).json({
                    validation:
                        "The product currently exists at the indicated production line."
                });
                return;
            }
            const response = await ProductionLineProductModel.create({
                production_line_id: Number(id),
                product_id
            });
            if (!response) {
                res.status(200).json({
                    alidation:
                        "The product could not be added to the production line"
                });
                return;
            }
            res.status(200).json({
                validation:
                    "Product added to production line successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        let { id, product_id } = req.params;
        try {
            const validatelocation = await ProductionLineModel.findOne({
                where: { id: id }
            });
            if (!validatelocation) {
                res.status(200).json({
                    validation: "Production line not found"
                });
                return;
            }

            const validatelocationProductionLine = await ProductionLineModel.findOne({
                where: { id: id },
                include: [
                    {
                        model: ProductionLineProductModel,
                        as: "production_lines_products",
                        attributes: ProductionLineProductModel.getAllFields(),
                        where: {
                            product_id: product_id
                        }
                    }
                ]
            });

            if (!validatelocationProductionLine) {
                res.status(200).json({
                    validation:
                        "Product not found in the production line to delete"
                });
                return;
            }

            const locationProductionLine = validatelocationProductionLine.toJSON();
            const response = await ProductionLineProductModel.destroy({
                where: {
                    production_line_id: locationProductionLine.id,
                    product_id: product_id
                },
                individualHooks: true
            });

            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "Product not found in the production line to delete"
                });
                return;
            }

            res.status(200).json({
                message:
                    "Product has been successfully removed from the production line"
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
}

export default ProductionLinesController;