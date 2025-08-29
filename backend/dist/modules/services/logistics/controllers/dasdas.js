"use strict";
// static createComplete = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     const {
//         status, carrier_id,
//         load_evidence, delivery_cost,
//         products } = req.body;
//     const transaction =
//         await sequelize.transaction({
//             isolationLevel:
//                 Transaction
//                     .ISOLATION_LEVELS
//                     .REPEATABLE_READ
//         });
//     try {
//         const validateCarrier =
//             await CarrierModel.findByPk(
//                 carrier_id,
//                 { transaction }
//             );
//         if (!validateCarrier) {
//             await transaction?.rollback();
//             res.status(404).json({
//                 validation:
//                     "The assigned carrier does not exist"
//             });
//             return;
//         }
//         const codeObject: { code: string }[] =
//             await sequelize.query(
//                 `SELECT func_generate_next_shipping_order_code()`
//                 + ` AS code;`,
//                 {
//                     type: QueryTypes.SELECT
//                 }
//             );
//         const new_code: string =
//             codeObject.shift()?.code as string;
//         const response = await ShippingOrderModel.create({
//             code: new_code,
//             status: status || "released",
//             carrier_id,
//             load_evidence:
//                 load_evidence || null,
//             delivery_cost
//         }, { transaction });
//         if (!response) {
//             await transaction?.rollback();
//             res.status(404).json({
//                 validation:
//                     "The shipping order could not be created"
//             });
//             return;
//         }
//         const shipping = response.toJSON();
//         const purchase_order_products:
//             ShippingOrderPurchaseOrderProductCreateAttributes[] =
//             products;
//         const pop: ShippingOrderPurchaseOrderProductCreateAttributes[] =
//             purchase_order_products.map(p => ({
//                 ...p,
//                 shipping_order_id: shipping.id
//             }));
//         const recordsToCreate:
//             ShippingOrderPurchaseOrderProductCreateAttributes[] = [];
//         for (const { shipping_order_id, purchase_order_product_id, qty } of pop) {
//             const validatePurchasedOrderProduct =
//                 await PurchaseOrderProductModel.findByPk(
//                     purchase_order_product_id,
//                     { transaction }
//                 );
//             if (!validatePurchasedOrderProduct) {
//                 await transaction?.rollback();
//                 res.status(404).json({
//                     validation:
//                         `The assigned purchase order `
//                         + `product does not exist`
//                 });
//                 return;
//             }
//             if (!(qty > 0)) {
//                 res.status(400).json({
//                     validation:
//                         "The qty must be greatest that zero"
//                 });
//             }
//             // const isCompletedPop =
//             //     validatePurchasedOrderProduct.toJSON();
//             // if (isCompletedPop.status === 'shipping') {
//             //     await transaction?.rollback();
//             //     res.status(409).json({
//             //         validation: `The purchased order product has`
//             //             + `already been assigned to a shipping order`
//             //     });
//             //     return;
//             // }
//             // if (isCompletedPop.status != 'completed') {
//             //     await transaction?.rollback();
//             //     res.status(400).json({
//             //         validation:
//             //             `The purchase order product has not been completed yet.`
//             //     });
//             //     return;
//             // }
//             // const validationPurchasedOrderProductDuplicate =
//             //     await ShippingOrderPurchaseOrderProductModel.findOne({
//             //         where: { purchase_order_product_id },
//             //         transaction
//             //     });
//             // if (validationPurchasedOrderProductDuplicate) {
//             //     await transaction?.rollback();
//             //     res.status(409).json({
//             //         validation:
//             //             `The purchase order product has already`
//             //             + ` been assigned to a shipping order`
//             //     });
//             //     return;
//             // }
//             // const validationDuplicate =
//             //     await ShippingOrderPurchaseOrderProductModel.findOne({
//             //         where: {
//             //             [Op.and]: [
//             //                 { shipping_order_id },
//             //                 { purchase_order_product_id }
//             //             ]
//             //         },
//             //         transaction
//             //     });
//             // if (validationDuplicate) {
//             //     await transaction?.rollback();
//             //     res.status(409).json({
//             //         validation:
//             //             `ShippingOrder - PurchaseOrderProduct`
//             //             + `relationship already exists`
//             //     });
//             //     return;
//             // }
//             const validateShippingOrderClientOnShippingOrder =
//                 await ShippingOrderPurchaseOrderProductModel.findAll({
//                     where: { shipping_order_id },
//                     attributes:
//                         ShippingOrderPurchaseOrderProductModel
//                             .getAllFields(),
//                     include: [{
//                         model: PurchaseOrderProductModel,
//                         as: "purchase_order_products",
//                         include: [
//                             {
//                                 model: PurchasedOrderModel,
//                                 as: "purchase_order",
//                                 attributes:
//                                     PurchasedOrderModel
//                                         .getAllFields()
//                             },
//                             {
//                                 model:
//                                     PurchasedOrdersProductsLocationsProductionLinesModel,
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
//                                         attributes:
//                                             LocationsProductionLinesModel
//                                                 .getAllFields()
//                                     }]
//                                 }]
//                             }
//                         ]
//                     }],
//                     transaction
//                 });
//             if (validateShippingOrderClientOnShippingOrder.length > 0) {
//                 const shippingOrderPoPsDetail:
//                     ShippingOrderPurchaseOrderProductCreateAttributes[] =
//                     validateShippingOrderClientOnShippingOrder
//                         .map(sh => sh.toJSON());
//                 const selectShippingOrderPoPTest:
//                     ShippingOrderPurchaseOrderProductCreateAttributes =
//                     shippingOrderPoPsDetail
//                         .shift() as ShippingOrderPurchaseOrderProductCreateAttributes;
//                 const obtainClientPurchaseOrderProduct =
//                     await PurchaseOrderProductModel.findOne({
//                         where: { id: purchase_order_product_id },
//                         attributes:
//                             PurchaseOrderProductModel
//                                 .getAllFields(),
//                         include: [
//                             {
//                                 model: PurchasedOrderModel,
//                                 as: "purchase_order",
//                                 attributes:
//                                     PurchasedOrderModel
//                                         .getAllFields()
//                             },
//                             {
//                                 model:
//                                     PurchasedOrdersProductsLocationsProductionLinesModel,
//                                 as: "purchase_order_product_location_production_line",
//                                 attributes:
//                                     PurchasedOrdersProductsLocationsProductionLinesModel
//                                         .getAllFields(),
//                                 include: [{
//                                     model: ProductionLineModel,
//                                     as: "production_line",
//                                     attributes:
//                                         ProductionLineModel
//                                             .getAllFields(),
//                                     include: [{
//                                         model: LocationsProductionLinesModel,
//                                         as: "location_production_line",
//                                         attributes:
//                                             LocationsProductionLinesModel
//                                                 .getAllFields()
//                                     }]
//                                 }],
//                                 where: { purchase_order_product_id }
//                             }
//                         ],
//                         transaction
//                     });
//                 const purchased_order_product_details =
//                     obtainClientPurchaseOrderProduct
//                         ?.toJSON() as PurchaseOrderProductAttributes;
//                 if (
//                     purchased_order_product_details
//                         ?.purchase_order?.client_id !==
//                     selectShippingOrderPoPTest
//                         ?.purchase_order_products
//                         ?.purchase_order?.client_id
//                 ) {
//                     await transaction?.rollback();
//                     res.status(400).json({
//                         validation:
//                             `The purchase order product does not belong`
//                             + `to the same client as the shipping order`
//                     });
//                     return;
//                 }
//                 if (purchased_order_product_details
//                     ?.purchase_order
//                     ?.client_address_id !==
//                     selectShippingOrderPoPTest
//                         ?.purchase_order_products
//                         ?.purchase_order
//                         ?.client_address_id) {
//                     await transaction?.rollback();
//                     res.status(400).json({
//                         validation:
//                             `The purchase order product does not belong`
//                             + `to the same client address as the shipping order`
//                     });
//                     return;
//                 }
//                 if (selectShippingOrderPoPTest.purchase_order_products
//                     ?.purchase_order_product_location_production_line
//                     ?.production_line?.location_production_line
//                     ?.location_id !==
//                     purchased_order_product_details
//                         ?.purchase_order_product_location_production_line
//                         ?.production_line
//                         ?.location_production_line?.location_id
//                 ) {
//                     await transaction?.rollback();
//                     res.status(400).json({
//                         validation:
//                             `The purchase order product does not belong`
//                             + `to the same location as the shipping order`
//                     });
//                     return;
//                 }
//                 recordsToCreate.push({
//                     shipping_order_id,
//                     purchase_order_product_id,
//                     qty
//                 });
//             } else {
//                 if (recordsToCreate.length > 0) {
//                     const
//                 } else {
//                     recordsToCreate.push({
//                         shipping_order_id,
//                         purchase_order_product_id,
//                         qty
//                     });
//                 }
//             }
//             // Agregar al arreglo para crear masivamente después
//         }
//         // Si todos pasaron las validaciones, crear todos juntos con bulkCreate
//         const response2 =
//             await ShippingOrderPurchaseOrderProductModel
//                 .bulkCreate(
//                     recordsToCreate,
//                     { transaction }
//                 );
//         if (!response2) {
//             await transaction?.rollback();
//             res.status(500).json({
//                 validation:
//                     `The asignation of the purchase order products`
//                     + `to the shipping order could not be created`
//             });
//             return;
//         }
//         await transaction?.commit();
//         res.status(201).json({
//             message:
//                 "Shipping order created succefally"
//         })
//     } catch (error: unknown) {
//         await transaction?.rollback();
//         if (error instanceof Error) {
//             next(error);
//         } else {
//             console.error(`An unexpected error ocurred ${error}`);
//         }
//     }
// }
// }
