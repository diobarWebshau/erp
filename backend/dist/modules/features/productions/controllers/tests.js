import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { QueryTypes, Transaction } from "sequelize";
import { InternalProductProductionOrderModel, ProductionOrderModel, ProductionModel, InternalProductionOrderLineProductModel, PurchasedOrdersProductsLocationsProductionLinesModel, } from "../../../associations.js";
class ProductionOrdersController {
    static update = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS.REPEATABLE_READ
        });
        const { id } = req.params;
        const { production_line, location, product, qty } = req.body;
        const body = req.body;
        console.log("******************************************************************************");
        console.log(body);
        console.log("******************************************************************************");
        let isSuccessfully = false;
        let orderType = "";
        try {
            const validatedProduction = await ProductionOrderModel.findByPk(id, { transaction });
            if (!validatedProduction) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "Production order not found"
                });
                return;
            }
            const relationship = validatedProduction.toJSON();
            const editableFields = ProductionOrderModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                await transaction.rollback();
                res.status(200).json({
                    validation: "No valid fields were provided to"
                        + " update the production order"
                });
                return;
            }
            if (update_values?.qty) {
                if (update_values.qty <= 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation: "The production order quantity must be"
                            + "greater than 0"
                    });
                    return;
                }
                if (relationship.order_type === 'client') {
                    const validateQtyProduction = await sequelize.query("CALL get_order_summary_by_pop(:order_id, :order_type);", {
                        replacements: {
                            order_id: relationship.order_id,
                            order_type: relationship.order_type
                        },
                        type: QueryTypes.SELECT,
                        transaction
                    });
                    const result = validateQtyProduction.shift();
                    const resultArray = Object.values(result).map((entry) => entry.result);
                    const summary = resultArray[0];
                    const new_qty = summary.qty + Number(relationship.qty);
                    if (new_qty === 0) {
                        await transaction.rollback();
                        res.status(400).json({
                            validation: `There are no units available for production order. `
                                + `All quantities for this order have already `
                                + `produced.`
                        });
                        return;
                    }
                    else if (update_values.qty > new_qty) {
                        await transaction.rollback();
                        res.status(400).json({
                            validation: `The quantity entered (${update_values.qty}) exceeds the `
                                + `remaining available units for this order.`
                                + ` Only ${new_qty} units are left`
                                + ` to produce.`
                        });
                        return;
                    }
                }
                else {
                    await InternalProductProductionOrderModel.update({
                        qty: update_values.qty,
                    }, {
                        where: { id: relationship.order_id },
                        transaction
                    });
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
                        validation: "No productions found linked to "
                            + "this production order."
                    });
                    return;
                }
                const productionOrder = response[0].toJSON();
                const totalProduced = productionOrder
                    .productions
                    .reduce((sum, production) => {
                    return sum + production.qty;
                }, 0);
                if (totalProduced < productionOrder.qty) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation: `Cannot complete the production order. `
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
                });
            }
            if (production_line) {
                if (relationship.order_type === 'client') {
                    const responseUpdatePurchaseOrderProductLocationProductionLine = await PurchasedOrdersProductsLocationsProductionLinesModel.update({
                        production_line_id: production_line.id,
                    }, {
                        where: {
                            purchase_order_product_id: relationship.order_id
                        },
                        transaction
                    });
                }
                else {
                    const responseUpdateInternalProductionOrderLineProduct = await InternalProductionOrderLineProductModel.update({
                        production_line_id: production_line.id
                    }, {
                        where: { internal_product_production_order_id: relationship.order_id },
                        transaction
                    });
                }
            }
            const response = await ProductionOrderModel.update(update_values, {
                where: { id: id },
                individualHooks: true,
                transaction
            });
            if (!(response[0] > 0)) {
                await transaction.rollback();
                res.status(400).json({
                    validation: "No changes were made to the production order"
                });
                return;
            }
            await transaction.commit();
            isSuccessfully = true;
            res.status(200).json({
                message: "Production order updated successfully"
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
        finally {
            if (isSuccessfully) {
                if (orderType === 'client') {
                    await sequelize.query(`CALL sp_update_movement_inventory_po_pop_update_fix(:id, :qty, :product_id, :product_name)`, {
                        replacements: {
                            id: id,
                            qty: qty,
                            product_id: product.id,
                            product_name: product.name,
                        },
                    });
                }
            }
        }
    };
}
export default ProductionOrdersController;
