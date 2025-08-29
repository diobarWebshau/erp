import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { Request, Response, NextFunction } from "express";
import { Model, Op, QueryTypes } from "sequelize";
import {
    ShippingOrderModel, PurchaseOrderProductModel,
    ShippingOrderPurchaseOrderProductModel, PurchasedOrderModel,
    PurchasedOrdersProductsLocationsProductionLinesModel,
    ProductionLineModel,
    LocationsProductionLinesModel,
    LocationModel,
    InventoryModel,
    InventoryLocationItemModel,
    ProductionOrderModel
} from "../../../associations.js";
import {
    ShippingOrderPurchaseOrderProductAttributes,
    PurchasedOrderAttributes,
    PurchaseOrderProductAttributes,
    LocationsProductionLinesAttributes,
    PurchasedOrderProductLocationProductionLineAttributes,
    ProductionLineAttributes,
} from "./../../../types.js"
import sequelize
    from "../../../../mysql/configSequelize.js";

interface ProductionLineDetails
    extends ProductionLineAttributes {
    location_production_line:
    LocationsProductionLinesAttributes
}

interface PurchasedOrdersProductsLocationsProductionLinesDetails
    extends PurchasedOrderProductLocationProductionLineAttributes {
    production_line: ProductionLineDetails
}

interface PurchasedOrderProductDetail
    extends PurchaseOrderProductAttributes {
    purchase_order: PurchasedOrderAttributes,
    purchase_order_product_location_production_line:
    PurchasedOrdersProductsLocationsProductionLinesDetails
}
interface ShippingOrderDetail
    extends ShippingOrderPurchaseOrderProductAttributes {
    purchase_order_products: PurchasedOrderProductDetail,
}

class ShippingOrderPurchaseOrderProductController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response =
                await ShippingOrderPurchaseOrderProductModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation:
                        "ShippingOrder-PurchaseOrderProduct "
                        + "relationships no found"
                });
                return;
            }
            const relationships = response.map(pi => pi.toJSON());
            res.status(200).json(relationships);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response =
                await ShippingOrderPurchaseOrderProductModel.findOne({
                    where: { id: id }
                });
            if (!response) {
                res.status(200).json({
                    validation:
                        "ShippingOrder-PurchaseOrderProduct "
                        + "relationship no found"
                });
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {
            shipping_order_id,
            purchase_order_product_id,
            qty
        } = req.body;
        try {

            const validateShippingOrder =
                await ShippingOrderModel
                    .findByPk(shipping_order_id);

            if (!validateShippingOrder) {
                res.status(200).json({
                    validation:
                        "Shipping order no found"
                });
                return;
            }

            const validatePurchasedOrderProduct =
                await PurchaseOrderProductModel
                    .findByPk(purchase_order_product_id);
            if (!validatePurchasedOrderProduct) {
                res.status(200).json({
                    validation:
                        "The assigned purchase order "
                        + "product does not exist"
                });
                return;
            }

            if (!(qty > 0)) {
                res.status(400).json({
                    validation:
                        "The qty must be greater than zero"
                });
            }

            const isCompletedPop =
                validatePurchasedOrderProduct.toJSON();
            if (isCompletedPop.status === 'shipping') {
                res.status(200).json({
                    validation:
                        `The purchased order product has already `
                        + `been assigned to a shipping order`
                });
                return;
            }

            // if (isCompletedPop.status != 'completed') {
            //     res.status(200).json({
            //         validation:
            //             `The purchase order has not `
            //             + `been completed yet.`
            //     });
            //     return;
            // }

            const validationPurchasedOrderProductFullyShipping =
                await ShippingOrderPurchaseOrderProductModel
                    .findAll({
                        where: {
                            purchase_order_product_id:
                                purchase_order_product_id
                        }
                    });

            console.log(validationPurchasedOrderProductFullyShipping);


            /*
                        const validateShippingOrderClientOnShippingOrder =
                            await ShippingOrderPurchaseOrderProductModel.findAll({
                                where: {
                                    shipping_order_id: shipping_order_id
                                },
                                attributes: ShippingOrderPurchaseOrderProductModel.getAllFields(),
                                include: [{
                                    model: PurchaseOrderProductModel,
                                    as: "purchase_order_products",
                                    include: [
                                        {
                                            model: PurchasedOrderModel,
                                            as: "purchase_order",
                                            attributes: PurchasedOrderModel.getAllFields()
                                        },
                                        {
                                            model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                            as: "purchase_order_product_location_production_line",
                                            attributes:
                                                PurchasedOrdersProductsLocationsProductionLinesModel
                                                    .getAllFields(),
                                            include: [{
                                                model: ProductionLineModel,
                                                attributes:
                                                    ProductionLineModel.getAllFields(),
                                                as: "production_line",
                                                include: [{
                                                    model: LocationsProductionLinesModel,
                                                    as: "location_production_line",
                                                    attributes:
                                                        LocationsProductionLinesModel.getAllFields()
                                                }]
                                            }],
                                        }
                                    ]
                                },
                                ]
                            });
            
                        if (validateShippingOrderClientOnShippingOrder.length > 0) {
                            const purchasedOrders: any =
                                validateShippingOrderClientOnShippingOrder
                                    .map(sh => sh.toJSON()) as ShippingOrderDetail[];
                            const purchased_order_details_aux =
                                purchasedOrders.shift() as ShippingOrderDetail;
                            const purchased_order_details =
                                purchased_order_details_aux
                                    .purchase_order_products.purchase_order as
                                PurchasedOrderAttributes;
                            const location_productionline_details =
                                purchased_order_details_aux
                                    .purchase_order_products
                                    .purchase_order_product_location_production_line
                                    .production_line;
                            const obtainClientPurchaseOrderProduct =
                                await PurchaseOrderProductModel.findOne({
                                    where: {
                                        id: purchase_order_product_id
                                    },
                                    attributes: PurchaseOrderProductModel.getAllFields(),
                                    include: [{
                                        model: PurchasedOrderModel,
                                        as: "purchase_order",
                                        attributes: PurchasedOrderModel.getAllFields(),
                                    }, {
                                        model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                        as: "purchase_order_product_location_production_line",
                                        attributes:
                                            PurchasedOrdersProductsLocationsProductionLinesModel
                                                .getAllFields(),
                                        include: [{
                                            model: ProductionLineModel,
                                            as: "production_line",
                                            attributes: ProductionLineModel.getAllFields(),
                                            include: [{
                                                model: LocationsProductionLinesModel,
                                                as: "location_production_line",
                                                attributes:
                                                    LocationsProductionLinesModel.getAllFields()
                                            }]
                                        }],
                                        where: {
                                            purchase_order_product_id:
                                                purchase_order_product_id
                                        },
                                    }]
                                });
                            const purchased_order_product_details =
                                obtainClientPurchaseOrderProduct?.toJSON() as PurchasedOrderProductDetail;
                            if (purchased_order_product_details.purchase_order.client_id
                                !== purchased_order_details.client_id) {
                                res.status(200).json({
                                    validation:
                                        "The purchase order product does not belong to the "
                                        + "same client as the shipping order"
                                });
                                return;
                            }
                            if (purchased_order_product_details.purchase_order.client_address_id
                                !== purchased_order_details.client_address_id) {
                                res.status(200).json({
                                    validation:
                                        "The purchase order product does not belong"
                                        + " to the same client address as the shipping order"
                                });
                                return;
                            }
                            if (location_productionline_details.location_production_line.location_id !==
                                purchased_order_product_details
                                    .purchase_order_product_location_production_line.production_line
                                    .location_production_line.location_id) {
                                res.status(200).json({
                                    validation:
                                        "The purchase order product does not" +
                                        " belong to the same location as the shipping order"
                                });
                                return;
                            }
                        }
                        const response =
                            await ShippingOrderPurchaseOrderProductModel.create({
                                shipping_order_id,
                                purchase_order_product_id,
                                qty
                            });
                        if (!response) {
                            res.status(200).json({
                                validation:
                                    "The ShippingOrder-PurchaseOrderProduct "
                                    + "relationship could not be created"
                            });
                            return;
                        }
                            */
            res.status(200).json({
                message: "ShippingOrder-PurchaseOrderProduct "
                    + "relationship created successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }



    // static bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
    //     // Recibimos un array de objetos con { shipping_order_id, purchase_order_product_id }
    //     const transaction = await sequelize.transaction();
    //     const items = req.body as Array<{ shipping_order_id: number; purchase_order_product_id: number, qty: number }>;

    //     try {
    //         const recordsToCreate: Array<{ shipping_order_id: number; purchase_order_product_id: number, qty: number }> = [];

    //         for (const { shipping_order_id, purchase_order_product_id, qty } of items) {

    //             interface IStatusOrder {
    //                 status: boolean,
    //                 original_order_qty: number,
    //                 order_committed_qty: number,
    //                 order_production_qty: number
    //             }

    //             interface IObjectStatusOrder {
    //                 statusOrder: IStatusOrder
    //             }

    //             const validate_correct_ordered: IObjectStatusOrder[] = await sequelize.query(
    //                 `SELECT is_pop_ordered_completetaly(: id) AS statusOrder; `,
    //                 {
    //                     replacements: { id: purchase_order_product_id },
    //                     type: QueryTypes.SELECT
    //                 }
    //             );
    //             const objectStatusOrder = validate_correct_ordered.shift();
    //             const statusOrder = objectStatusOrder?.statusOrder;

    //             if (!statusOrder?.status) {
    //                 res.status(400).json({
    //                     validation:
    //                         `The total quantity does not match the sum of `
    //                         + `committed inventory and production order. ` +
    //                         `Requested: ${statusOrder?.original_order_qty}, ` +
    //                         `Committed: ${statusOrder?.order_committed_qty}, ` +
    //                         `To produce: ${statusOrder?.order_production_qty}.`
    //                 });
    //                 return;
    //             }
    //             const validateShippingOrder =
    //                 await ShippingOrderModel.findByPk(
    //                     shipping_order_id,
    //                 );
    //             if (!validateShippingOrder) {
    //                 res.status(404).json({
    //                     validation: "Shipping order no found"
    //                 });
    //                 return;
    //             }

    //             const validatePurchasedOrderProduct =
    //                 await PurchaseOrderProductModel.findByPk(
    //                     purchase_order_product_id,
    //                 );
    //             if (!validatePurchasedOrderProduct) {
    //                 transaction.rollback();
    //                 res.status(404).json({
    //                     validation:
    //                         "The assigned purchase order product does not exist"
    //                 });
    //                 return;
    //             }

    //             const isCompletedPop = validatePurchasedOrderProduct.toJSON();
    //             if (isCompletedPop.status === 'shipping') {
    //                 res.status(200).json({
    //                     validation:
    //                         `The purchased order product has `
    //                         + `already been assigned to a shipping order`
    //                 });
    //                 return;
    //             }

    //             if (isCompletedPop.status != 'completed') {
    //                 res.status(200).json({
    //                     validation:
    //                         "The purchase order has not been completed yet."
    //                 });
    //                 return;
    //             }

    //             interface PurchasedOrderProductL
    //                 extends Partial<PurchaseOrderProductAttributes> {
    //                 purchase_order_product_location_production_line:
    //                 PurchasedOrdersProductsLocationsProductionLinesL
    //             }

    //             interface PurchasedOrdersProductsLocationsProductionLinesL
    //                 extends Partial<PurchasedOrderProductLocationProductionLineAttributes> {
    //                 production_line: ProductionLineAttributes
    //             }

    //             // interface ProductionLineL
    //             //     extends Partial<ProductionLineAttributes> {
    //             //     location_production_line: LocationProductionLineL
    //             // }

    //             // interface LocationProductionLineL
    //             //     extends Partial<LocationsProductionLinesAttributes> {
    //             //     location: LocationAttributes
    //             // }

    //             const locationPurchasedOrderProductResponse =
    //                 await PurchaseOrderProductModel.findOne({
    //                     where: { id: isCompletedPop.id },
    //                     attributes: ["id"],
    //                     include: [{
    //                         model: PurchasedOrdersProductsLocationsProductionLinesModel,
    //                         as: 'purchase_order_product_location_production_line',
    //                         attributes: ["id"],
    //                         include: [
    //                             {
    //                                 model: ProductionLineModel,
    //                                 as: "production_line",
    //                                 attributes: ["id"],
    //                                 include: [{
    //                                     model: LocationsProductionLinesModel,
    //                                     as: 'location_production_line',
    //                                     attributes: ["id"],
    //                                     include: [{
    //                                         model: LocationModel,
    //                                         as: 'location',
    //                                         attributes: LocationModel.getAllFields()
    //                                     }]
    //                                 }]
    //                             }
    //                         ],
    //                     }]
    //                 });

    //             const locationPurchasedOrderProduct =
    //                 locationPurchasedOrderProductResponse?.toJSON() as PurchasedOrderProductL;
    //             const location: LocationCreateAttributes | undefined =
    //                 locationPurchasedOrderProduct
    //                     ?.purchase_order_product_location_production_line
    //                     ?.production_line
    //                     ?.location_production_line
    //                     ?.location;

    //             if (!location) {
    //                 res.status(200).json({
    //                     validation:
    //                         `This purchase order product is not` +
    //                         ` assigned to any location.`
    //                 });
    //                 return;
    //             }
    //             if (isCompletedPop.status !== 'completed') {
    //                 const inventoryProductLocationResponse =
    //                     await sequelize.query(
    //                         `CALL getInventoryByLocation(); `,
    //                         { type: QueryTypes.RAW }
    //                     );

    //                 interface ObjectItem {
    //                     stock: number;
    //                     item_id: number;
    //                     available: number;
    //                     item_name: string;
    //                     item_type: string;
    //                     location_id: number;
    //                     committed_qty: number;
    //                     location_name: string;
    //                     pending_production_qty: number;
    //                 }
    //                 const inventoriesLocations =
    //                     inventoryProductLocationResponse as { inventories: ObjectItem[] }[];
    //                 const formattedLocations =
    //                     inventoriesLocations.map(loc => loc.inventories);
    //                 const locationInventory =
    //                     formattedLocations.find(
    //                         inventory => inventory[0]?.location_id === location.id
    //                     );
    //                 if (!locationInventory) {
    //                     res.status(404).json({
    //                         validation:
    //                             "No inventory found for the assigned location."
    //                     });
    //                     return;
    //                 }
    //                 const inventories = locationInventory.filter(
    //                     item =>
    //                         item.item_id === isCompletedPop.product_id &&
    //                         item.item_type === 'product'
    //                 );
    //                 const inventory = inventories.shift();
    //                 const responseProduction = await ProductionOrderModel.findAll({
    //                     where: {
    //                         order_id: isCompletedPop.product_id,
    //                         order_type: 'client'
    //                     }
    //                 });
    //                 const data =
    //                     responseProduction.map(K => K.toJSON());
    //                 const qty_ordered =
    //                     Number(data.reduce((acc, value) => acc + value.qty, 0));
    //                 if (inventory?.available && inventory?.available <= qty_ordered) {

    //                 }
    //             }

    //             const validationPurchasedOrderProductDuplicate =
    //                 await ShippingOrderPurchaseOrderProductModel.findOne({
    //                     where: { purchase_order_product_id }
    //                 });
    //             if (validationPurchasedOrderProductDuplicate) {
    //                 res.status(200).json({
    //                     validation:
    //                         `The purchase order product has already `
    //                         + `been assigned to a shipping order`
    //                 });
    //                 return;
    //             }

    //             const validationDuplicate =
    //                 await ShippingOrderPurchaseOrderProductModel.findOne({
    //                     where: {
    //                         [Op.and]: [
    //                             { shipping_order_id },
    //                             { purchase_order_product_id }
    //                         ]
    //                     }
    //                 });
    //             if (validationDuplicate) {
    //                 res.status(200).json({
    //                     validation:
    //                         `ShippingOrder - PurchaseOrderProduct relationship`
    //                         + `already exists`
    //                 });
    //                 return;
    //             }

    //             const validateShippingOrderClientOnShippingOrder =
    //                 await ShippingOrderPurchaseOrderProductModel.findAll({
    //                     where: { shipping_order_id },
    //                     attributes: ShippingOrderPurchaseOrderProductModel.getAllFields(),
    //                     include: [{
    //                         model: PurchaseOrderProductModel,
    //                         as: "purchase_order_products",
    //                         include: [
    //                             {
    //                                 model: PurchasedOrderModel,
    //                                 as: "purchase_order",
    //                                 attributes: PurchasedOrderModel.getAllFields()
    //                             },
    //                             {
    //                                 model: PurchasedOrdersProductsLocationsProductionLinesModel,
    //                                 as: "purchase_order_product_location_production_line",
    //                                 attributes:
    //                                     PurchasedOrdersProductsLocationsProductionLinesModel
    //                                         .getAllFields(),
    //                                 include: [{
    //                                     model: ProductionLineModel,
    //                                     attributes: ProductionLineModel.getAllFields(),
    //                                     as: "production_line",
    //                                     include: [{
    //                                         model: LocationsProductionLinesModel,
    //                                         as: "location_production_line",
    //                                         attributes: LocationsProductionLinesModel.getAllFields()
    //                                     }]
    //                                 }]
    //                             }
    //                         ]
    //                     }]
    //                 });

    //             if (validateShippingOrderClientOnShippingOrder.length > 0) {
    //                 const purchasedOrders: any =
    //                     validateShippingOrderClientOnShippingOrder.map(sh => sh.toJSON());
    //                 const purchased_order_details_aux =
    //                     purchasedOrders.shift() as ShippingOrderDetail;
    //                 const purchased_order_details =
    //                     purchased_order_details_aux
    //                         .purchase_order_products.purchase_order as PurchasedOrderAttributes;
    //                 const location_productionline_details =
    //                     purchased_order_details_aux.purchase_order_products.
    //                         purchase_order_product_location_production_line.production_line;

    //                 const obtainClientPurchaseOrderProduct = await PurchaseOrderProductModel.findOne({
    //                     where: { id: purchase_order_product_id },
    //                     attributes: PurchaseOrderProductModel.getAllFields(),
    //                     include: [
    //                         {
    //                             model: PurchasedOrderModel,
    //                             as: "purchase_order",
    //                             attributes: PurchasedOrderModel.getAllFields()
    //                         },
    //                         {
    //                             model: PurchasedOrdersProductsLocationsProductionLinesModel,
    //                             as: "purchase_order_product_location_production_line",
    //                             attributes: PurchasedOrdersProductsLocationsProductionLinesModel.getAllFields(),
    //                             include: [{
    //                                 model: ProductionLineModel,
    //                                 as: "production_line",
    //                                 attributes: ProductionLineModel.getAllFields(),
    //                                 include: [{
    //                                     model: LocationsProductionLinesModel,
    //                                     as: "location_production_line",
    //                                     attributes: LocationsProductionLinesModel.getAllFields()
    //                                 }]
    //                             }],
    //                             where: { purchase_order_product_id }
    //                         }
    //                     ]
    //                 });
    //                 const purchased_order_product_details =
    //                     obtainClientPurchaseOrderProduct?.toJSON() as PurchasedOrderProductDetail;

    //                 if (purchased_order_product_details.purchase_order.client_id
    //                     !== purchased_order_details.client_id) {
    //                     res.status(200).json({
    //                         validation:
    //                             'The purchase order product does not belong to '
    //                             + 'the same client as the shipping order'
    //                     });
    //                     return;
    //                 }
    //                 if (purchased_order_product_details.purchase_order.client_address_id
    //                     !== purchased_order_details.client_address_id) {
    //                     res.status(200).json({
    //                         validation:
    //                             'The purchase order product does not belong'
    //                             + ' to the same client address as the shipping order'
    //                     });
    //                     return;
    //                 }
    //                 if ((location_productionline_details.location_production_line.location_id) !==
    //                     (purchased_order_product_details.
    //                         purchase_order_product_location_production_line.production_line.
    //                         location_production_line.location_id)) {
    //                     res.status(200).json({
    //                         validation:
    //                             'The purchase order product does not belong '
    //                             + 'to the same location as the shipping order'
    //                     });
    //                     return;
    //                 }
    //             }

    //             // Agregar al arreglo para crear masivamente después
    //             recordsToCreate.push({ shipping_order_id, purchase_order_product_id, qty });
    //         }

    //         // Si todos pasaron las validaciones, crear todos juntos con bulkCreate
    //         const response =
    //             await ShippingOrderPurchaseOrderProductModel.bulkCreate(
    //                 recordsToCreate,
    //                 { transaction: transaction }
    //             );

    //         if (!response) {
    //             transaction.rollback();
    //             res.status(200).json({
    //                 validation:
    //                     "The ShippingOrder-PurchaseOrderProduct relationship could not be created"
    //             });
    //             return;
    //         }

    //         await transaction.commit();

    //         res.status(200).json({
    //             message:
    //                 "ShippingOrder-PurchaseOrderProduct relationships created successfully"
    //         });

    //     } catch (error: unknown) {
    //         if (error instanceof Error) {
    //             next(error);
    //         } else {
    //             console.error(`An unexpected error ocurred ${error} `);
    //         }
    //     }
    // };


    // static bulkCreate2 = async (req: Request, res: Response, next: NextFunction) => {
    //     // Recibimos un array de objetos con { shipping_order_id, purchase_order_product_id }
    //     const transaction = await sequelize.transaction();
    //     const items = req.body as Array<{ shipping_order_id: number; purchase_order_product_id: number }>;

    //     try {
    //         const recordsToCreate: Array<{ shipping_order_id: number; purchase_order_product_id: number }> = [];

    //         for (const { shipping_order_id, purchase_order_product_id } of items) {

    //             interface IStatusOrder {
    //                 status: boolean,
    //                 original_order_qty: number,
    //                 order_committed_qty: number,
    //                 order_production_qty: number
    //             }

    //             interface IObjectStatusOrder {
    //                 statusOrder: IStatusOrder
    //             }

    //             const validate_correct_ordered: IObjectStatusOrder[] = await sequelize.query(
    //                 `SELECT is_pop_ordered_completetaly(: id) AS statusOrder; `,
    //                 {
    //                     replacements: { id: purchase_order_product_id },
    //                     type: QueryTypes.SELECT
    //                 }
    //             );
    //             const objectStatusOrder = validate_correct_ordered.shift();
    //             const statusOrder = objectStatusOrder?.statusOrder;

    //             if (!statusOrder?.status) {
    //                 res.status(400).json({
    //                     validation:
    //                         `The total quantity does not match the sum of `
    //                         + `committed inventory and production order. ` +
    //                         `Requested: ${ statusOrder?.original_order_qty }, ` +
    //                         `Committed: ${ statusOrder?.order_committed_qty }, ` +
    //                         `To produce: ${ statusOrder?.order_production_qty }.`
    //                 });
    //                 return;
    //             }
    //             const validateShippingOrder =
    //                 await ShippingOrderModel.findByPk(
    //                     shipping_order_id,
    //                 );
    //             if (!validateShippingOrder) {
    //                 res.status(404).json({
    //                     validation: "Shipping order no found"
    //                 });
    //                 return;
    //             }

    //             const validatePurchasedOrderProduct =
    //                 await PurchaseOrderProductModel.findByPk(
    //                     purchase_order_product_id,
    //                 );
    //             if (!validatePurchasedOrderProduct) {
    //                 transaction.rollback();
    //                 res.status(404).json({
    //                     validation:
    //                         "The assigned purchase order product does not exist"
    //                 });
    //                 return;
    //             }

    //             const isCompletedPop = validatePurchasedOrderProduct.toJSON();
    //             if (isCompletedPop.status === 'shipping') {
    //                 res.status(200).json({
    //                     validation:
    //                         `The purchased order product has `
    //                         + `already been assigned to a shipping order`
    //                 });
    //                 return;
    //             }

    //             if (isCompletedPop.status != 'completed') {
    //                 res.status(200).json({
    //                     validation:
    //                         "The purchase order has not been completed yet."
    //                 });
    //                 return;
    //             }

    //             interface PurchasedOrderProductL
    //                 extends Partial<PurchaseOrderProductAttributes> {
    //                 purchase_order_product_location_production_line:
    //                 PurchasedOrdersProductsLocationsProductionLinesL
    //             }

    //             interface PurchasedOrdersProductsLocationsProductionLinesL
    //                 extends Partial<PurchasedOrderProductLocationProductionLineAttributes> {
    //                 production_line: ProductionLineAttributes
    //             }

    //             // interface ProductionLineL
    //             //     extends Partial<ProductionLineAttributes> {
    //             //     location_production_line: LocationProductionLineL
    //             // }

    //             // interface LocationProductionLineL
    //             //     extends Partial<LocationsProductionLinesAttributes> {
    //             //     location: LocationAttributes
    //             // }

    //             const locationPurchasedOrderProductResponse =
    //                 await PurchaseOrderProductModel.findOne({
    //                     where: { id: isCompletedPop.id },
    //                     attributes: ["id"],
    //                     include: [{
    //                         model: PurchasedOrdersProductsLocationsProductionLinesModel,
    //                         as: 'purchase_order_product_location_production_line',
    //                         attributes: ["id"],
    //                         include: [
    //                             {
    //                                 model: ProductionLineModel,
    //                                 as: "production_line",
    //                                 attributes: ["id"],
    //                                 include: [{
    //                                     model: LocationsProductionLinesModel,
    //                                     as: 'location_production_line',
    //                                     attributes: ["id"],
    //                                     include: [{
    //                                         model: LocationModel,
    //                                         as: 'location',
    //                                         attributes: LocationModel.getAllFields()
    //                                     }]
    //                                 }]
    //                             }
    //                         ],
    //                     }]
    //                 });

    //             const locationPurchasedOrderProduct =
    //                 locationPurchasedOrderProductResponse?.toJSON() as PurchasedOrderProductL;
    //             const location: LocationCreateAttributes | undefined =
    //                 locationPurchasedOrderProduct
    //                     ?.purchase_order_product_location_production_line
    //                     ?.production_line
    //                     ?.location_production_line
    //                     ?.location;

    //             if (!location) {
    //                 res.status(200).json({
    //                     validation:
    //                         `This purchase order product is not` +
    //                         ` assigned to any location.`
    //                 });
    //                 return;
    //             }
    //             if (isCompletedPop.status !== 'completed') {
    //                 const inventoryProductLocationResponse =
    //                     await sequelize.query(
    //                         `CALL getInventoryByLocation(); `,
    //                         { type: QueryTypes.RAW }
    //                     );

    //                 interface ObjectItem {
    //                     stock: number;
    //                     item_id: number;
    //                     available: number;
    //                     item_name: string;
    //                     item_type: string;
    //                     location_id: number;
    //                     committed_qty: number;
    //                     location_name: string;
    //                     pending_production_qty: number;
    //                 }
    //                 const inventoriesLocations =
    //                     inventoryProductLocationResponse as { inventories: ObjectItem[] }[];
    //                 const formattedLocations =
    //                     inventoriesLocations.map(loc => loc.inventories);
    //                 const locationInventory =
    //                     formattedLocations.find(
    //                         inventory => inventory[0]?.location_id === location.id
    //                     );
    //                 if (!locationInventory) {
    //                     res.status(404).json({
    //                         validation:
    //                             "No inventory found for the assigned location."
    //                     });
    //                     return;
    //                 }
    //                 const inventories = locationInventory.filter(
    //                     item =>
    //                         item.item_id === isCompletedPop.product_id &&
    //                         item.item_type === 'product'
    //                 );
    //                 const inventory = inventories.shift();
    //                 const responseProduction = await ProductionOrderModel.findAll({
    //                     where: {
    //                         order_id: isCompletedPop.product_id,
    //                         order_type: 'client'
    //                     }
    //                 });
    //                 const data =
    //                     responseProduction.map(K => K.toJSON());
    //                 const qty_ordered =
    //                     Number(data.reduce((acc, value) => acc + value.qty, 0));
    //                 if (inventory?.available && inventory?.available <= qty_ordered) {

    //                 }
    //             }

    //             const validationPurchasedOrderProductDuplicate =
    //                 await ShippingOrderPurchaseOrderProductModel.findOne({
    //                     where: { purchase_order_product_id }
    //                 });
    //             if (validationPurchasedOrderProductDuplicate) {
    //                 res.status(200).json({
    //                     validation:
    //                         `The purchase order product has already `
    //                         + `been assigned to a shipping order`
    //                 });
    //                 return;
    //             }

    //             const validationDuplicate =
    //                 await ShippingOrderPurchaseOrderProductModel.findOne({
    //                     where: {
    //                         [Op.and]: [
    //                             { shipping_order_id },
    //                             { purchase_order_product_id }
    //                         ]
    //                     }
    //                 });
    //             if (validationDuplicate) {
    //                 res.status(200).json({
    //                     validation:
    //                         `ShippingOrder - PurchaseOrderProduct relationship`
    //                         + `already exists`
    //                 });
    //                 return;
    //             }

    //             const validateShippingOrderClientOnShippingOrder =
    //                 await ShippingOrderPurchaseOrderProductModel.findAll({
    //                     where: { shipping_order_id },
    //                     attributes: ShippingOrderPurchaseOrderProductModel.getAllFields(),
    //                     include: [{
    //                         model: PurchaseOrderProductModel,
    //                         as: "purchase_order_products",
    //                         include: [
    //                             {
    //                                 model: PurchasedOrderModel,
    //                                 as: "purchase_order",
    //                                 attributes: PurchasedOrderModel.getAllFields()
    //                             },
    //                             {
    //                                 model: PurchasedOrdersProductsLocationsProductionLinesModel,
    //                                 as: "purchase_order_product_location_production_line",
    //                                 attributes:
    //                                     PurchasedOrdersProductsLocationsProductionLinesModel
    //                                         .getAllFields(),
    //                                 include: [{
    //                                     model: ProductionLineModel,
    //                                     attributes: ProductionLineModel.getAllFields(),
    //                                     as: "production_line",
    //                                     include: [{
    //                                         model: LocationsProductionLinesModel,
    //                                         as: "location_production_line",
    //                                         attributes: LocationsProductionLinesModel.getAllFields()
    //                                     }]
    //                                 }]
    //                             }
    //                         ]
    //                     }]
    //                 });

    //             if (validateShippingOrderClientOnShippingOrder.length > 0) {
    //                 const purchasedOrders: any =
    //                     validateShippingOrderClientOnShippingOrder.map(sh => sh.toJSON());
    //                 const purchased_order_details_aux =
    //                     purchasedOrders.shift() as ShippingOrderDetail;
    //                 const purchased_order_details =
    //                     purchased_order_details_aux
    //                         .purchase_order_products.purchase_order as PurchasedOrderAttributes;
    //                 const location_productionline_details =
    //                     purchased_order_details_aux.purchase_order_products.
    //                         purchase_order_product_location_production_line.production_line;

    //                 const obtainClientPurchaseOrderProduct = await PurchaseOrderProductModel.findOne({
    //                     where: { id: purchase_order_product_id },
    //                     attributes: PurchaseOrderProductModel.getAllFields(),
    //                     include: [
    //                         {
    //                             model: PurchasedOrderModel,
    //                             as: "purchase_order",
    //                             attributes: PurchasedOrderModel.getAllFields()
    //                         },
    //                         {
    //                             model: PurchasedOrdersProductsLocationsProductionLinesModel,
    //                             as: "purchase_order_product_location_production_line",
    //                             attributes: PurchasedOrdersProductsLocationsProductionLinesModel.getAllFields(),
    //                             include: [{
    //                                 model: ProductionLineModel,
    //                                 as: "production_line",
    //                                 attributes: ProductionLineModel.getAllFields(),
    //                                 include: [{
    //                                     model: LocationsProductionLinesModel,
    //                                     as: "location_production_line",
    //                                     attributes: LocationsProductionLinesModel.getAllFields()
    //                                 }]
    //                             }],
    //                             where: { purchase_order_product_id }
    //                         }
    //                     ]
    //                 });
    //                 const purchased_order_product_details =
    //                     obtainClientPurchaseOrderProduct?.toJSON() as PurchasedOrderProductDetail;

    //                 if (purchased_order_product_details.purchase_order.client_id
    //                     !== purchased_order_details.client_id) {
    //                     res.status(200).json({
    //                         validation:
    //                             'The purchase order product does not belong to '
    //                             + 'the same client as the shipping order'
    //                     });
    //                     return;
    //                 }
    //                 if (purchased_order_product_details.purchase_order.client_address_id
    //                     !== purchased_order_details.client_address_id) {
    //                     res.status(200).json({
    //                         validation:
    //                             'The purchase order product does not belong'
    //                             + ' to the same client address as the shipping order'
    //                     });
    //                     return;
    //                 }
    //                 if ((location_productionline_details.location_production_line.location_id) !==
    //                     (purchased_order_product_details.
    //                         purchase_order_product_location_production_line.production_line.
    //                         location_production_line.location_id)) {
    //                     res.status(200).json({
    //                         validation:
    //                             'The purchase order product does not belong '
    //                             + 'to the same location as the shipping order'
    //                     });
    //                     return;
    //                 }
    //             }

    //             // Agregar al arreglo para crear masivamente después
    //             recordsToCreate.push({ shipping_order_id, purchase_order_product_id });
    //         }

    //         // Si todos pasaron las validaciones, crear todos juntos con bulkCreate
    //         const response =
    //             await ShippingOrderPurchaseOrderProductModel.bulkCreate(
    //                 recordsToCreate,
    //                 { transaction: transaction }
    //             );

    //         if (!response) {
    //             transaction.rollback();
    //             res.status(200).json({
    //                 validation:
    //                     "The ShippingOrder-PurchaseOrderProduct relationship could not be created"
    //             });
    //             return;
    //         }

    //         await transaction.commit();

    //         res.status(200).json({
    //             message:
    //                 "ShippingOrder-PurchaseOrderProduct relationships created successfully"
    //         });

    //     } catch (error: unknown) {
    //         if (error instanceof Error) {
    //             next(error);
    //         } else {
    //             console.error(`An unexpected error ocurred ${ error } `);
    //         }
    //     }
    // };

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
                if (update_values?.shipping_order_id
                    && !validateShippingOrder) {
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
                    attributes: ShippingOrderPurchaseOrderProductModel.getAllFields(),
                    include: [{
                        model: PurchaseOrderProductModel,
                        as: "purchase_order_products",
                        include: [{
                            model: PurchasedOrderModel,
                            as: "purchase_order",
                        }, {
                            model: PurchasedOrdersProductsLocationsProductionLinesModel,
                            as: "purchase_order_product_location_production_line",
                            include: [{
                                model: ProductionLineModel,
                                as: "production_line",
                                include: [{
                                    model: LocationsProductionLinesModel,
                                    as: "location_production_line",
                                    attributes:
                                        LocationsProductionLinesModel.getAllFields()
                                }]
                            }],
                        }]
                    },
                    ]
                });
            if (validateShippingOrderClientOnShippingOrder.length > 0) {
                const purchasedOrders: ShippingOrderDetail[] =
                    validateShippingOrderClientOnShippingOrder.map(sh => sh.toJSON()) as ShippingOrderDetail[];
                const purchased_order_details_aux: ShippingOrderDetail =
                    purchasedOrders.shift() as ShippingOrderDetail;
                const purchased_order_details: PurchasedOrderAttributes =
                    purchased_order_details_aux.purchase_order_products.purchase_order;
                const location_productionline_details: ProductionLineDetails =
                    purchased_order_details_aux
                        .purchase_order_products
                        .purchase_order_product_location_production_line.production_line;
                const obtainClientPurchaseOrderProduct =
                    await PurchaseOrderProductModel.findOne({
                        where: {
                            id: update_values?.purchase_order_product_id
                                || relationship.purchase_order_product_id
                        },
                        attributes: PurchaseOrderProductModel.getAllFields(),
                        include: [
                            {
                                model: PurchasedOrderModel,
                                as: "purchase_order",
                                attributes: PurchasedOrderModel.getAllFields(),
                            },
                            {
                                model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                as: "purchase_order_product_location_production_line",
                                attributes:
                                    PurchasedOrdersProductsLocationsProductionLinesModel
                                        .getAllFields(),
                                include: [{
                                    model: ProductionLineModel,
                                    as: "production_line",
                                    attributes: ProductionLineModel.getAllFields(),
                                    include: [{
                                        model: LocationsProductionLinesModel,
                                        as: "location_production_line",
                                        attributes:
                                            LocationsProductionLinesModel.getAllFields()
                                    }]
                                }],
                                where: {
                                    id: update_values?.purchase_order_product_id
                                        || relationship.purchase_order_product_id
                                },
                            }
                        ]
                    });
                const purchased_order_product_details =
                    obtainClientPurchaseOrderProduct?.toJSON() as PurchasedOrderProductDetail;
                if (purchased_order_product_details.status
                    != "completed") {
                    res.status(200).json({
                        validation:
                            "The purchase order has not been completed yet."
                    });
                    return;
                }
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
                if (location_productionline_details.location_production_line.location_id !==
                    purchased_order_product_details
                        .purchase_order_product_location_production_line.production_line
                        .location_production_line.location_id) {
                    res.status(200).json({
                        validation:
                            "The purchase order product does not belong to "
                            + "the same location as the shipping order"
                    });
                    return;
                }
            }
            if (update_values?.purchase_order_product_id) {
                const validationPurchasedOrderProductDuplicate:
                    ShippingOrderPurchaseOrderProductModel | null =
                    await ShippingOrderPurchaseOrderProductModel.findOne({
                        where: {
                            purchase_order_product_id:
                                update_values?.purchase_order_product_id
                        }
                    });
                if (validationPurchasedOrderProductDuplicate) {
                    res.status(200).json({
                        validation:
                            "The purchase order product has already been "
                            + "assigned to a shipping order"
                    });
                    return;
                }
            }
            const validateCreation: ShippingOrderPurchaseOrderProductModel | null =
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
                        "ShippingOrder-PurchaseOrderProduct "
                        + "relationship already exists"
                })
                return;
            }
            const response: number[] =
                await ShippingOrderPurchaseOrderProductModel.update(
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
                console.error(`An unexpected error ocurred ${error} `);
            }
        }
    }
    static deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response =
                await ShippingOrderPurchaseOrderProductModel.destroy({
                    where: { id: id }, individualHooks: true
                });
            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "ShippingOrder-PurchaseOrderProduct "
                        + "relationship no found for delete"
                });
                return;
            }
            res.status(200).json({
                message:
                    "ShippingOrder-PurchaseOrderProduct "
                    + "relationship deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error} `);
            }
        }
    }

    static prueba = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const locationPurchasedOrderProduct = await PurchaseOrderProductModel.findOne({
                where: { id: 1 },
                attributes: ["id"],
                include: [{
                    model: PurchasedOrdersProductsLocationsProductionLinesModel,
                    as: 'purchase_order_product_location_production_line',
                    attributes: ["id"],
                    include: [
                        {
                            model: ProductionLineModel,
                            as: "production_line",
                            attributes: ["id"],
                            include: [{
                                model: LocationsProductionLinesModel,
                                as: 'location_production_line',
                                attributes: ["id"],
                                include: [{
                                    model: LocationModel,
                                    as: 'location',
                                    attributes: LocationModel.getAllFields()
                                }]
                            }]
                        }
                    ],
                }]
            });

            const inventoryProductLocationResponse = await sequelize.query(
                `CALL getInventoryByLocation(); `,
                { type: QueryTypes.RAW }
            );

            interface ObjectItem {
                stock: number;
                item_id: number;
                available: number;
                item_name: string;
                item_type: string;
                location_id: number;
                committed_qty: number;
                location_name: string;
                pending_production_qty: number;
            }

            const inventoriesLocations = inventoryProductLocationResponse as { inventories: ObjectItem[] }[];
            const formattedLocations = inventoriesLocations.map(loc => loc.inventories);

            // Obtener el inventario correspondiente a la location deseada
            const locationInventory = formattedLocations.find(
                inventory => inventory[0]?.location_id === 1
            );

            if (!locationInventory) {
                res.status(404).json({
                    validation: "No inventory found for the assigned location."
                });
                return;
            }

            // Filtrar el producto específico de tipo 'product'
            const inventories = locationInventory.filter(
                item =>
                    item.item_id === 1 &&
                    item.item_type === 'product'
            );
            const inventory = inventories.shift();
            const responseProduction = await ProductionOrderModel.findAll({
                where: {
                    order_id: 1,
                    order_type: 'client'
                }
            });
            const data =
                responseProduction.map(K => K.toJSON());
            const qty_ordered = Number(
                data.reduce((acc, value) => acc + value.qty, 0));

            res.status(200).json(qty_ordered);

        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error} `);
            }
        }
    }
}
export default ShippingOrderPurchaseOrderProductController;