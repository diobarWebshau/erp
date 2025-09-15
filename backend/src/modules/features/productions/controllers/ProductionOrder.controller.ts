import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    Request,
    Response,
    NextFunction
} from "express";
import sequelize
    from "../../../../mysql/configSequelize.js";
import {
    QueryTypes,
    Transaction
} from "sequelize";
import {
    Model,
    ModelStatic
} from "sequelize";
import {
    InternalProductProductionOrderModel,
    ProductionOrderModel, ProductModel,
    PurchaseOrderProductModel,
    ProductionModel,
    InternalProductionOrderLineProductModel,
    PurchasedOrdersProductsLocationsProductionLinesModel,
    ProductionLineModel,
} from "../../../associations.js";
import {
    ProductionOrderAttributes
} from "../models/references/ProductionOrders.model.js";
import {
    InternalProductProductionOrderAttributes
} from "../models/junctions/internal_product_production_order.model.js";
import {
    LocationAttributes,
    ProductAttributes,
    PurchaseOrderProductAttributes
} from "./../../../types.js";
import {
    ProductionAttributes,
    ProductionLineAttributes
} from "../types.js";

/*
    solo permite acceder a propiedades en comun, ya que
    heredan de la misma interface
    Esto pasa porque TypeScript no puede saber en tiempo
    de compilación cuál de los dos tipos es realmente. 
    Entonces, por seguridad, te deja trabajar solo con 
    lo que ambos comparten.
*/
type Order =
    PurchaseOrderProductAttributes
    | InternalProductProductionOrderAttributes;

// tipado para el resultado del procedimiento almacenado
interface SummaryItem {
    qty: number,
    committed_qty: number,
    production_qty: number,
    commited_qty: number
}

interface Summary {
    result: SummaryItem,
}


class ProductionOrdersController {
    static getAll =
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const response:
                    ProductionOrderModel[] =
                    await ProductionOrderModel.findAll({
                        attributes: [
                            ...ProductionOrderModel.getAllFields(),
                            [
                                sequelize.literal(
                                    "func_get_extra_data_production_order(`ProductionOrderModel`.`id`, `ProductionOrderModel`.`order_type`)"
                                ),
                                "extra_data"
                            ]
                        ],
                        include: [
                            {
                                model: ProductionModel,
                                as: "productions",
                                attributes:
                                    ProductionModel.getAllFields()
                            },
                            {
                                model: ProductModel,
                                as: "product",
                                attributes:
                                    ProductModel.getAllFields()
                            },
                        ]
                    });
                if (response.length < 1) {
                    res.status(200).json([]);
                    return;
                }
                const productionOrders: ProductionOrderAttributes[] =
                    response.map(u => u.toJSON());
                res.status(200).json(productionOrders);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(`
                    An unexpected error occurred: ${error}`);
                }
            }
        }

    static getById =
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            try {
                const response:
                    ProductionOrderModel | null =
                    await ProductionOrderModel.findByPk(id, {
                        attributes: [
                            ...ProductionOrderModel.getAllFields(),
                            [
                                sequelize.literal(
                                    "func_get_extra_data_production_order(`ProductionOrderModel`.`id`, `ProductionOrderModel`.`order_type`)"
                                ),
                                "extra_data"
                            ],
                            [
                                sequelize.literal(
                                    "get_extra_date_purchased_order_detail(`ProductionOrderModel`.`order_id`, `ProductionOrderModel`.`order_type`)"
                                ),
                                "extra_data2"
                            ]
                        ],
                        include: [
                            {
                                model: ProductionModel,
                                as: "productions",
                                attributes:
                                    ProductionModel.getAllFields()
                            },
                            {
                                model: ProductModel,
                                as: "product",
                                attributes:
                                    ProductModel.getAllFields()
                            },
                        ]
                    });
                if (!response) {
                    res.status(404).json(null);
                    return;
                }
                const productionOrder: ProductionOrderAttributes =
                    response.toJSON();
                res.status(200).json(productionOrder);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(`
                        An unexpected error ocurred ${error}`);
                }
            }
        }

    static getDetailsById =
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            try {
                const response: ProductionOrderModel | null = await
                    ProductionOrderModel.findOne({
                        where: {
                            id: id
                        },
                        attributes:
                            ProductionOrderModel
                                .getAllFields(),
                        include: [
                            {
                                model: ProductionModel,
                                as: "productions",
                                attributes:
                                    ProductionModel.getAllFields()
                            },
                            {
                                model: InternalProductProductionOrderModel,
                                as: "internal_order",
                                attributes:
                                    InternalProductProductionOrderModel.getAllFields()
                            },
                            {
                                model: PurchaseOrderProductModel,
                                as: "purchase_order_product",
                                attributes:
                                    PurchaseOrderProductModel.getAllFields()
                            }
                        ]
                    });
                if (!response) {
                    res.status(404).json({
                        validation: "Production order no found"
                    });
                    return;
                }
                const productionOrder: ProductionOrderAttributes =
                    response.toJSON();
                res.status(200).json(productionOrder);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(`
                        An unexpected error ocurred ${error}`);
                }
            }
        }


    static create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });

        let isSucessfull: boolean = false;
        let po_id: number | null = null;

        const {
            order_type, order_id, product_name,
            product_id, qty, status,
            production_line, location, product, purchase_order
        } = req.body as ProductionOrderAttributes;

        let orderId: number | null = order_id;


        console.log(`Empieza la creacion de la orden de produccion`);

        try {

            // usamos el tipo base de cualquier modelo Sequelize
            let orderModel: ModelStatic<Model>;
            switch (order_type) {
                case "internal":
                    orderModel =
                        InternalProductProductionOrderModel;
                    break;
                case "client":
                    orderModel =
                        PurchaseOrderProductModel;
                    break;
                default:
                    res.status(400).json({
                        validation: "The order type is not valid"
                    });
                    return;
            }

            // Aqui no afecta el tipado porque no se acceden a las propiedades
            if (order_type === "internal" && location && product) {
                const responseCreateInternalOrder =
                    await InternalProductProductionOrderModel.create({
                        product_name: product_name,
                        location_id: location.id,
                        location_name: location.name,
                        product_id: product.id,
                        qty: qty,
                        status: status,
                    }, { transaction });

                if (!responseCreateInternalOrder) {
                    await transaction.rollback();
                    res.status(500).json({
                        validation: "The internal order could not be created"
                    });
                    return;
                }
                const internalOrder = responseCreateInternalOrder.toJSON();
                orderId = internalOrder.id;
            }

            if (order_type === "client" && orderId) {

                const responsePurchaseOrder =
                    await PurchaseOrderProductModel.findByPk(orderId);

                if (!responsePurchaseOrder) {
                    await transaction.rollback();
                    res.status(404).json({
                        validation: "Purchase order no existe"
                    });
                    return;
                }

                const validateOrder: InternalProductProductionOrderModel | null =
                    await orderModel.findByPk(orderId);

                if (!validateOrder) {
                    await transaction.rollback();
                    res.status(404).json({
                        validation: "Order product not found"
                    });
                    return;
                }

                // Aqui si afecta el tipado porque se acceden a las propiedades
                const order =
                    validateOrder.toJSON() as Order;
                const order_product_id: number = order.product_id;

                if (order_product_id !== product_id) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "The product id does not match with the order"
                    });
                    return;
                }

                const validateProduct:
                    ProductModel | null = await
                        ProductModel.findByPk(order_product_id);

                if (!validateProduct) {
                    await transaction.rollback();
                    res.status(404).json({
                        validation: "Product does not exist"
                    });
                    return;
                }

                if (qty <= 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "The production order quantity must be greater than 0"
                    });
                    return;
                }

                const validateQtyProduction: Object[] = await sequelize.query(
                    "CALL get_order_summary_by_pop(:order_id, :order_type);", {
                    replacements: {
                        order_id: orderId,
                        order_type: order_type
                    },
                    type: QueryTypes.SELECT,
                    transaction: transaction
                });

                const result: Summary = validateQtyProduction.shift() as Summary;
                const resultArray: SummaryItem[] =
                    Object.values(result).map((entry) => entry.result);
                const summary: SummaryItem = resultArray[0];

                if (summary.qty === 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            `It is not possible to create a new production order. `
                            + `All units for this product order have already been assigned.`
                    });
                    return;
                } else if (qty > summary.qty) {
                    if (summary.qty > 0) {
                        await transaction.rollback();
                        res.status(400).json({
                            validation:
                                `Cannot create the new production order with the entered quantity (${qty}). `
                                + `Only ${summary.qty} units are still available for this product order.`
                        });
                        return;
                    } else {
                        await transaction.rollback();
                        res.status(400).json({
                            validation:
                                `Cannot create the production order. This `
                                + `productionproduct order has already been completed.`
                        });
                    }
                }

            }

            if (production_line) {
                console.log("Si tiene linea de produccion");

                const responseProductionLine =
                    await ProductionLineModel.findByPk(production_line.id);
                if (!responseProductionLine) {
                    await transaction.rollback();
                    res.status(404).json({
                        validation: "Production line no existe"
                    });
                    return;
                }

                if (order_type === "internal") {
                    console.log("asigno la linea de produccion a la orden de produccion interna")
                    const responseInternalProductionOrderLineProduct =
                        await InternalProductionOrderLineProductModel.create({
                            internal_product_production_order_id: orderId,
                            production_line_id: production_line.id
                        }, { transaction });

                    if (!responseInternalProductionOrderLineProduct) {
                        await transaction.rollback();
                        res.status(500).json({
                            validation:
                                `No se pudo asignar la orden de produccion` +
                                ` interna a la linea de produccion`
                        });
                        return;
                    }
                } else {
                    console.log("asigno la linea de produccion a la orden de produccion interna")
                    const responsePurchasedOrdersProductsLocationsProductionLines =
                        await PurchasedOrdersProductsLocationsProductionLinesModel.create({
                            purchase_order_product_id: orderId,
                            production_line_id: production_line.id
                        }, { transaction });

                    if (!responsePurchasedOrdersProductsLocationsProductionLines) {
                        await transaction.rollback();
                        res.status(500).json({
                            validation:
                                `No se pudo asignar la orden de produccion` +
                                ` asociado a una orden de compra a la linea `
                                + `de produccion`
                        });
                        return;
                    }
                }
            }

            const response: ProductionOrderModel
                = await ProductionOrderModel.create({
                    order_id: orderId,
                    order_type: order_type,
                    product_id: product_id,
                    product_name: product_name,
                    qty,
                    status: "pending"
                }, { transaction });

            if (!response) {
                await transaction.rollback();
                res.status(400).json({
                    validation:
                        "The production order could not be created"
                });
                return;
            }

            const po = response.toJSON();

            isSucessfull = true;
            po_id = po.id;

            transaction.commit();

            console.log('Termino la creacion de la orden de produccion');

            res.status(201).json(po);
        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) {
                console.error(`
                    An unexpected error ocurred ${error}`);
                next(error);
            } else {
                console.error(`
                        An unexpected error ocurred ${error}`);
            }
        } finally {
            if (po_id && product && isSucessfull) {
                console.log('Se empieza a ejecutar el stored procedure');
                await sequelize.query(
                    `CALL handle_production_order_after_insert(:id, :order_id, :order_type, :product_id, :product_name, :qty)`,
                    {
                        replacements: {
                            id: po_id,
                            order_id: orderId,
                            order_type: order_type,
                            product_id: product_id,
                            product_name: product.name,
                            qty: qty
                        },
                    }
                );
                console.log('Se termino de ejecutar el stored procedure');
            }
        }
    }

    static update2 =
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const body = req.body;
            try {
                const validatedProduction:
                    ProductionOrderModel | null =
                    await ProductionOrderModel.findByPk(id);
                if (!validatedProduction) {
                    res.status(404).json({
                        validation: "Production order not found"
                    });
                    return;
                }
                const relationship: ProductionOrderAttributes =
                    validatedProduction.toJSON();
                const editableFields: string[] =
                    ProductionOrderModel.getEditableFields();
                const update_values =
                    collectorUpdateFields(editableFields, body);
                if (!(Object.keys(update_values).length > 0)) {
                    res.status(200).json({
                        validation:
                            "No valid fields were provided to"
                            + " update the production order"
                    });
                    return;
                }
                if (update_values?.qty) {
                    if (update_values.qty <= 0) {
                        res.status(400).json({
                            validation:
                                "The production order quantity must be"
                                + "greater than 0"
                        });
                        return;
                    }
                    const validateQtyProduction: object[] = await sequelize.query(
                        "CALL get_order_summary_by_pop(:order_id, :order_type);", {
                        replacements: {
                            order_id: relationship.order_id,
                            order_type: relationship.order_type
                        },
                        type: QueryTypes.SELECT,
                    });
                    const result: Summary =
                        validateQtyProduction.shift() as Summary;
                    const resultArray =
                        Object.values(result).map((entry) => entry.result);
                    const summary: SummaryItem = resultArray[0];
                    const new_qty: number = summary.qty + Number(relationship.qty);
                    if (new_qty === 0) {
                        res.status(400).json({
                            validation:
                                `There are no units available for production order. `
                                + `All quantities for this order have already `
                                + `produced.`
                        });
                        return;
                    } else if (update_values.qty > new_qty) {
                        res.status(400).json({
                            validation:
                                `The quantity entered (${update_values.qty}) exceeds the `
                                + `remaining available units for this order.`
                                + ` Only ${new_qty} units are left`
                                + ` to produce.`
                        });
                        return;
                    }
                }
                if (update_values?.status === 'completed') {
                    const response = await ProductionOrderModel.findAll({
                        where: { id: id },
                        attributes: ProductionOrderModel.getAllFields(),
                        include: [{
                            model: ProductionModel,
                            as: "productions",
                            attributes: ProductionModel.getAllFields()
                        }]
                    });

                    if (!(response.length > 0)) {
                        res.status(404).json({
                            validation:
                                "No productions found linked to "
                                + "this production order."
                        });
                        return;
                    }
                    const productionOrder: any = response[0].toJSON();
                    const totalProduced =
                        productionOrder
                            .productions
                            .reduce((sum: number, production: any) => {
                                return sum + production.qty;
                            }, 0);

                    if (totalProduced < productionOrder.qty) {
                        res.status(400).json({
                            validation:
                                `Cannot complete the production order. `
                                + `Total produced (${totalProduced}) is less than `
                                + `the required quantity (${productionOrder.qty}).`
                        });
                        return;
                    }
                }
                const response: number[] = await ProductionOrderModel.update(
                    update_values, { where: { id: id }, individualHooks: true });
                if (!(response[0] > 0)) {
                    res.status(400).json({
                        validation:
                            "No changes were made to the production order"
                    });
                    return;
                }
                res.status(200).json({
                    message: "Production order updated successfully"
                });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    console.error(`
                        An unexpected error ocurred ${error}`);
                }
            }
        }
    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validateOrderResponse = await ProductionOrderModel.findByPk(id);

            if (!validateOrderResponse) {
                res.status(404).json({
                    validation: "Production order not found"
                });
                return;
            }

            const productionOrder = validateOrderResponse.toJSON();

            if (productionOrder.order_type === "client") {
                const validatePurchaseOrderProduct: PurchaseOrderProductModel | null =
                    await PurchaseOrderProductModel.findByPk(productionOrder.id);

                const purchasedOrderProduct: PurchaseOrderProductAttributes | undefined =
                    validatePurchaseOrderProduct?.toJSON();

                if (purchasedOrderProduct
                    && purchasedOrderProduct.status === "shipping") {
                    res.status(400).json({
                        validation:
                            "This production order cannot be deleted because the "
                            + "related purchase order is already in shipping status"
                    });
                    return;
                }
            }

            interface ProductionOrderDetail extends ProductionOrderAttributes {
                productions: ProductionAttributes[];
            }

            const validateHasProductions: ProductionOrderModel | null =
                await ProductionOrderModel.findOne({
                    where: { id: productionOrder.id },
                    attributes: ProductionOrderModel.getAllFields(),
                    include: [{
                        model: ProductionModel,
                        as: "productions",
                        attributes: ProductionModel.getAllFields()
                    }]
                });

            const productionOrderDetail: ProductionOrderDetail | undefined =
                validateHasProductions?.toJSON();

            if (productionOrderDetail &&
                productionOrderDetail.productions.length > 0) {
                res.status(400).json({
                    validation:
                        "This production order cannot be deleted because it "
                        + "has one or more associated production records"
                });
                return;
            }

            const response: number = await ProductionOrderModel.destroy({
                where: { id: id },
                individualHooks: true
            });

            if (response < 1) {
                res.status(404).json({
                    validation: "Production order not found for deletion"
                });
                return;
            }

            res.status(200).json({
                message: "Production order deleted successfully"
            });

        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }


    static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const transaction = await sequelize.transaction({
            isolationLevel:
                Transaction
                    .ISOLATION_LEVELS.REPEATABLE_READ
        });

        const { id } = req.params;
        const { production_line, location, product, qty }: {
            production_line: ProductionLineAttributes,
            location: LocationAttributes,
            product: ProductAttributes,
            qty: number
        } = req.body;
        const body = req.body;

        console.log("******************************************************************************");
        console.log(body);
        console.log("******************************************************************************");

        let isSuccessfully = false;
        let orderType = "";

        try {

            const validatedProduction:
                ProductionOrderModel | null =
                await ProductionOrderModel.findByPk(id, { transaction });
            if (!validatedProduction) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "Production order not found"
                });
                return;
            }

            const relationship: ProductionOrderAttributes =
                validatedProduction.toJSON();
            const editableFields: string[] =
                ProductionOrderModel.getEditableFields();
            const update_values =
                collectorUpdateFields(editableFields, body);

            if (!(Object.keys(update_values).length > 0)) {
                await transaction.rollback();
                res.status(200).json({
                    validation:
                        "No valid fields were provided to"
                        + " update the production order"
                });
                return;
            }

            if (update_values?.qty) {
                if (update_values.qty <= 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "The production order quantity must be"
                            + "greater than 0"
                    });
                    return;
                }

                if (relationship.order_type === 'client') {

                    const validateQtyProduction: object[] = await sequelize.query(
                        "CALL get_order_summary_by_pop(:order_id, :order_type);", {
                        replacements: {
                            order_id: relationship.order_id,
                            order_type: relationship.order_type
                        },
                        type: QueryTypes.SELECT,
                        transaction
                    });
                    const result: Summary =
                        validateQtyProduction.shift() as Summary;
                    const resultArray =
                        Object.values(result).map((entry) => entry.result);
                    const summary: SummaryItem = resultArray[0];
                    const new_qty: number = summary.qty + Number(relationship.qty);
                    if (new_qty === 0) {
                        await transaction.rollback();
                        res.status(400).json({
                            validation:
                                `There are no units available for production order. `
                                + `All quantities for this order have already `
                                + `produced.`
                        });
                        return;
                    } else if (update_values.qty > new_qty) {
                        await transaction.rollback();
                        res.status(400).json({
                            validation:
                                `The quantity entered (${update_values.qty}) exceeds the `
                                + `remaining available units for this order.`
                                + ` Only ${new_qty} units are left`
                                + ` to produce.`
                        });
                        return;
                    }
                } else {
                    await InternalProductProductionOrderModel.update({
                        qty: update_values.qty,
                    }, {
                        where: { id: relationship.order_id },
                        transaction
                    })
                }
            }

            if (update_values?.status === 'completed') {
                const response = await ProductionOrderModel.findAll({
                    where: { id: id },
                    attributes: ProductionOrderModel.getAllFields(),
                    include: [{
                        model: ProductionModel,
                        as: "productions",
                        attributes: ProductionModel.getAllFields()
                    }],
                    transaction
                });

                if (!(response.length > 0)) {
                    await transaction.rollback();
                    res.status(404).json({
                        validation:
                            "No productions found linked to "
                            + "this production order."
                    });
                    return;
                }
                const productionOrder: any = response[0].toJSON();
                const totalProduced =
                    productionOrder
                        .productions
                        .reduce((sum: number, production: any) => {
                            return sum + production.qty;
                        }, 0);

                if (totalProduced < productionOrder.qty) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            `Cannot complete the production order. `
                            + `Total produced (${totalProduced}) is less than `
                            + `the required quantity (${productionOrder.qty}).`
                    });
                    return;
                }
            }

            if (location) {
                console.log("******************************************************************************");
                console.log(location);
                console.log("******************************************************************************");
                console.log(location.id, relationship.order_id, location.name);
                console.log(relationship);

                const responsedasdasd = await InternalProductProductionOrderModel.findByPk(relationship.order_id, { transaction });
                console.log("Registro encontrado ******************************************************************************");
                console.log(responsedasdasd?.toJSON());
                console.log("******************************************************************************");
                const responseUpdateInternalProductProductionOrder = await InternalProductProductionOrderModel.update({
                    location_id: location.id,
                    location_name: location.name,
                }, {
                    where: { id: relationship.order_id },
                    transaction
                })
                console.log(`actualizo registro de internal_product_production_order`)
                console.log(responseUpdateInternalProductProductionOrder[0])
            }

            if (production_line) {
                if (relationship.order_type === 'client') {
                    const responseUpdatePurchaseOrderProductLocationProductionLine =
                        await PurchasedOrdersProductsLocationsProductionLinesModel.update({
                            production_line_id: production_line.id,
                        }, {
                            where: {
                                purchase_order_product_id: relationship.order_id
                            },
                            transaction
                        });
                } else {
                    const responseUpdateInternalProductionOrderLineProduct =
                        await InternalProductionOrderLineProductModel.update({
                            production_line_id: production_line.id
                        }, {
                            where: { internal_product_production_order_id: relationship.order_id },
                            transaction
                        });
                }
            }

            console.log("******************************************************************************");
            console.log(id);
            console.log(update_values);
            console.log("******************************************************************************");

            const response: number[] = await ProductionOrderModel.update(
                update_values, {
                where: { id: id },
                individualHooks: true,
                transaction
            });

            console.log("******************************************************************************");
            console.log(response);
            console.log(response[0]);
            console.log("******************************************************************************");

            if (!(response[0] > 0)) {
                await transaction.rollback();
                res.status(400).json({
                    validation:
                        "No changes were made to the production order"
                });
                return;
            }

            await transaction.commit();

            isSuccessfully = true;

            res.status(200).json({
                message: "Production order updated successfully"
            });
        } catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        } finally {
            if (isSuccessfully) {
                if (orderType === 'client') {
                    await sequelize.query(
                        `CALL sp_update_movement_inventory_po_pop_update_fix(:id, :qty, :product_id, :product_name)`,
                        {
                            replacements: {
                                id: id,
                                qty: qty,
                                product_id: product.id,
                                product_name: product.name,
                            },
                        }
                    );
                }
            }
        }
    }
}

export default ProductionOrdersController;