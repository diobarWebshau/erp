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
                await InternalProductProductionOrderModel.update({
                    location_id: location.id,
                    location_name: location.name,
                }, {
                    where: { id: relationship.order_id },
                    transaction
                })
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

            const response: number[] = await ProductionOrderModel.update(
                update_values, {
                where: { id: id },
                individualHooks: true,
                transaction
            });

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