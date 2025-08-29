import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    ShippingOrderModel, PurchaseOrderProductModel,
    ShippingOrderPurchaseOrderProductModel, PurchasedOrderModel,
    PurchasedOrdersProductsLocationsProductionLinesModel,
    ProductionLineModel
} from "../../../associations.js";
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";

class ShippingOrderPurchaseOrderProductController {
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validateRelationship =
                await ShippingOrderPurchaseOrderProductModel.findByPk(id);
            if (!validateRelationship) {
                res.status(200).json({
                    validation:
                        "ShippingOrder-PurchaseOrderProduct relationship no "
                        + "found for update"
                });
                return;
            }
            const relationship = validateRelationship.toJSON();
            const editableFields =
                ShippingOrderPurchaseOrderProductModel.getEditableFields();
            const update_values =
                collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "No validated properties were found for updating" +
                        "the type assignment to the location"
                });
                return;
            }

            if (update_values?.purchase_order_product_id
                || update_values?.shipping_order_id) {
                const [validateShippingOrder, validatePurchaseOrderProduct] =
                    await Promise.all([
                        update_values?.shipping_order_id
                            ? ShippingOrderModel.findByPk(
                                update_values.shipping_order_id)
                            : null,
                        update_values?.purchase_order_product_id
                            ? PurchaseOrderProductModel.findByPk(
                                update_values.purchase_order_product_id)
                            : null
                    ]);
                if (update_values?.shipping_order_id && !validateShippingOrder) {
                    res.status(404).json({
                        validation:
                            "The assigned shipping order does not exist"
                    });
                    return;
                }
                if (update_values?.purchase_order_product_id
                    && !validatePurchaseOrderProduct) {
                    res.status(404).json({
                        validation:
                            "The assigned purchase order product does not exist"
                    });
                    return;
                }
            }
            const validateShippingOrderClientOnShippingOrder =
                await ShippingOrderPurchaseOrderProductModel.findAll({
                    where: {
                        shipping_order_id:
                            update_values.shipping_order_id
                            || relationship.shipping_order_id
                    },
                    attributes: ["id"],
                    include: [{
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_product",
                        include: [{
                            model: PurchasedOrderModel,
                            as: "purchase_order",
                        }, {
                            model: PurchasedOrdersProductsLocationsProductionLinesModel,
                            as: "purchase_order_product_locations_production_lines",
                            include: [{
                                model: ProductionLineModel,
                                as: "production_line",
                            }],
                        }]
                    },
                    ]
                });
            if (validateShippingOrderClientOnShippingOrder.length > 0) {
                const purchasedOrders: any =
                    validateShippingOrderClientOnShippingOrder.map(sh => sh.toJSON());
                const purchased_order_details_aux = purchasedOrders.pop();
                const purchased_order_details =
                    purchased_order_details_aux.purchase_order_product.purchase_order;
                const location_productionline_details =
                    purchased_order_details_aux
                        .purchase_order_product
                        .purchase_order_product_locations_production_lines
                        .production_line;
                const obtainClientPurchaseOrderProduct =
                    await PurchaseOrderProductModel.findOne({
                        where: {
                            id: relationship.purchase_order_product_id
                        },
                        attributes: PurchaseOrderProductModel.getAllFields(),
                        include: [{
                            model: PurchasedOrderModel,
                            as: "purchase_order",
                            attributes: PurchasedOrderModel.getAllFields(),
                        }, {
                            model: PurchasedOrdersProductsLocationsProductionLinesModel,
                            as: "purchase_order_product_locations_production_lines",
                            attributes:
                                PurchasedOrdersProductsLocationsProductionLinesModel
                                    .getAllFields(),
                            include: [{
                                model: ProductionLineModel,
                                as: "production_line",
                                attributes: ProductionLineModel.getAllFields(),
                            }],
                            where: {
                                purchase_order_product_id:
                                    relationship.purchase_order_product_id
                            },
                        }]
                    });
                const purchased_order_product_details: any =
                    obtainClientPurchaseOrderProduct?.toJSON();
                if (purchased_order_product_details.purchase_order.client_id
                    !== purchased_order_details.client_id) {
                    res.status(200).json({
                        validation:
                            "The purchase order product does not belong to "
                            + "the same client as the shipping order"
                    });
                    return;
                }
                if (purchased_order_product_details.purchase_order.client_address_id
                    !== purchased_order_details.client_address_id) {
                    res.status(200).json({
                        validation:
                            "The purchase order product does not belong to"
                            + " the same client address as the shipping order"
                    });
                    return;
                }
                if (location_productionline_details.location_id !==
                    purchased_order_product_details.
                        purchase_order_product_locations_production_lines.
                        production_line.location_id) {
                    res.status(200).json({
                        validation:
                            "The purchase order product does not belong to the same "
                            + "location as the shipping order"
                    });
                    return;
                }
            }

            const validateCreation =
                await ShippingOrderPurchaseOrderProductModel.findOne({
                    where: {
                        [Op.and]: [
                            {
                                shipping_order_id:
                                    update_values.shipping_order_id
                                    || relationship.shipping_order_id
                            },
                            {
                                purchase_order_product_id:
                                    update_values.purchase_order_product_id
                                    || relationship.purchase_order_product_id
                            },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
            if (validateCreation) {
                res.status(200).json({
                    validate:
                        "ShippingOrder-PurchaseOrderProduct relationship already exists"
                })
                return;
            }
            const response = await ShippingOrderPurchaseOrderProductModel.update(
                update_values,
                { where: { id: id } }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the "
                        + "ShippingOrder-PurchaseOrderProduct relationship"
                })
                return;
            }
            res.status(200).json({
                message: "ShippingOrder-PurchaseOrderProduct"
                    + "relationship updated succefally"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}
export default ShippingOrderPurchaseOrderProductController;