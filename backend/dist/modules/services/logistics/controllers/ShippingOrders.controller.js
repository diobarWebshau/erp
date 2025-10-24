import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import ShippingOrderModel from "../models/references/ShippingOrders.model.js";
import { QueryTypes, Transaction } from "sequelize";
import CarrierModel from "../models/base/Carriers.model.js";
import ImageHandler from "../../../../classes/ImageHandler.js";
import { formatImagesDeepRecursive, formatWith64Multiple } from "../../../../scripts/formatWithBase64.js";
import { PurchaseOrderProductModel, PurchasedOrderModel, PurchasedOrdersProductsLocationsProductionLinesModel, ProductionLineModel, LocationsProductionLinesModel, ShippingOrderPurchaseOrderProductModel, ClientModel, ClientAddressesModel, LocationModel, ProductModel } from "../../../associations.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { Op } from "sequelize";
import path from 'node:path';
import fs, { constants, mkdir, access } from "node:fs/promises";
import { coerceValue } from "../../../../helpers/normalizedObjectFromFormData.js";
const deleteLoadEvidences = async (evidences) => {
    if (!Array.isArray(evidences) || evidences.length === 0)
        return;
    await Promise.allSettled(evidences.map((evidence) => ImageHandler.removeImageIfExists(evidence.path)));
};
class ShippingOrderController {
    static getAll = async (req, res, next) => {
        const { filter, ...rest } = req.query;
        try {
            // 1️⃣ Condición base (para exclusiones)
            const excludePerField = Object.fromEntries(Object.entries(rest)
                .filter(([k, v]) => v !== undefined && k !== "code")
                .map(([k, v]) => [
                k,
                Array.isArray(v) ? { [Op.notIn]: v } : { [Op.ne]: v },
            ]));
            // 2️⃣ Filtro de búsqueda general
            const filterConditions = [];
            if (filter && filter.trim()) {
                const f = `%${filter.trim()}%`; // busca en cualquier parte
                filterConditions.push({ code: { [Op.like]: f } }, // code del shipping order
                { "$carrier.name$": { [Op.like]: f } }, // nombre del carrier
                { "$shipping_order_purchase_order_product.purchase_order_products.purchase_order.client.company_name$": { [Op.like]: f } }, // cliente
                { "$shipping_order_purchase_order_product.purchase_order_products.purchase_order_product_location_production_line.production_line.location_production_line.location.name$": { [Op.like]: f } } // location
                );
            }
            // 3️⃣ Construimos el WHERE principal
            const where = {
                ...excludePerField,
                ...(filterConditions.length > 0 ? { [Op.or]: filterConditions } : {}),
            };
            // 4️⃣ Consulta completa
            const response = await ShippingOrderModel.findAll({
                where,
                attributes: ShippingOrderModel.getAllFields(),
                include: [
                    {
                        model: CarrierModel,
                        as: "carrier",
                        required: false,
                        attributes: CarrierModel.getAllFields(),
                    },
                    {
                        model: ShippingOrderPurchaseOrderProductModel,
                        as: "shipping_order_purchase_order_product",
                        required: false,
                        attributes: ShippingOrderPurchaseOrderProductModel.getAllFields(),
                        include: [
                            {
                                model: PurchaseOrderProductModel,
                                as: "purchase_order_products",
                                required: false,
                                attributes: [
                                    ...PurchaseOrderProductModel.getAllFields(),
                                    [
                                        sequelize.literal("func_get_production_summary_of_pop(`shipping_order_purchase_order_product->purchase_order_products`.id)"),
                                        "production_order"
                                    ],
                                    [
                                        sequelize.literal("funct_get_stock_available_of_pop_on_location(`shipping_order_purchase_order_product->purchase_order_products`.id)"),
                                        "stock_available"
                                    ],
                                    [
                                        sequelize.fn("func_get_inventory_movements_commited_pop", sequelize.col("shipping_order_purchase_order_product->purchase_order_products.id")),
                                        "inventory_commited"
                                    ]
                                ],
                                include: [
                                    {
                                        model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                        as: "purchase_order_product_location_production_line",
                                        required: false,
                                        attributes: PurchasedOrdersProductsLocationsProductionLinesModel.getAllFields(),
                                        include: [
                                            {
                                                model: ProductionLineModel,
                                                as: "production_line",
                                                required: false,
                                                attributes: ProductionLineModel.getAllFields(),
                                                include: [
                                                    {
                                                        model: LocationsProductionLinesModel,
                                                        as: "location_production_line",
                                                        required: false,
                                                        attributes: LocationsProductionLinesModel.getAllFields(),
                                                        include: [
                                                            {
                                                                model: LocationModel,
                                                                as: "location",
                                                                required: false,
                                                                attributes: LocationModel.getAllFields(),
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        model: ProductModel,
                                        as: "product",
                                        required: false,
                                        attributes: ProductModel.getAllFields(),
                                    },
                                    {
                                        model: PurchasedOrderModel,
                                        as: "purchase_order",
                                        required: false,
                                        attributes: PurchasedOrderModel.getAllFields(),
                                        include: [
                                            {
                                                model: ClientModel,
                                                as: "client",
                                                required: false,
                                                attributes: ClientModel.getAllFields(),
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                model: LocationModel,
                                as: "location",
                                required: false,
                                attributes: LocationModel.getAllFields(),
                            }
                        ],
                    },
                ],
            });
            // 5️⃣ Si no hay resultados
            if (response.length < 1) {
                res.status(200).json({ validation: "Shipping orders not found" });
                return;
            }
            // 6️⃣ Post-procesamiento
            const shippingOrders = await formatWith64Multiple(response, "load_evidence", "path");
            res.status(200).json(shippingOrders);
        }
        catch (error) {
            if (error instanceof Error)
                next(error);
            else
                console.error(`An unexpected error occurred: ${error}`);
        }
    };
    static getDetailsById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ShippingOrderModel.findOne({
                where: { id },
                attributes: ShippingOrderModel
                    .getAllFields(),
                include: [
                    {
                        model: CarrierModel,
                        as: "carrier",
                        attributes: CarrierModel
                            .getAllFields()
                    },
                    {
                        model: ShippingOrderPurchaseOrderProductModel,
                        as: "shipping_order_purchase_order_product",
                        attributes: ShippingOrderPurchaseOrderProductModel
                            .getAllFields(),
                        include: [
                            {
                                model: PurchaseOrderProductModel,
                                as: "purchase_order_products",
                                attributes: [
                                    ...PurchaseOrderProductModel.getAllFields(),
                                    [
                                        sequelize.literal("func_get_production_summary_of_pop(`shipping_order_purchase_order_product->purchase_order_products`.id)"),
                                        "production_order"
                                    ],
                                    [
                                        sequelize.literal("funct_get_stock_available_of_pop_on_location(`shipping_order_purchase_order_product->purchase_order_products`.id)"),
                                        "stock_available"
                                    ],
                                    [
                                        sequelize.fn("func_get_inventory_movements_commited_pop", sequelize.col("shipping_order_purchase_order_product->purchase_order_products.id")),
                                        "inventory_commited"
                                    ],
                                    [
                                        sequelize.fn("func_summary_shipping_on_client_order", sequelize.col("shipping_order_purchase_order_product->purchase_order_products.id")),
                                        "shipping_summary"
                                    ]
                                ],
                                include: [
                                    {
                                        model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                        as: "purchase_order_product_location_production_line",
                                        attributes: PurchasedOrdersProductsLocationsProductionLinesModel
                                            .getAllFields(),
                                        include: [
                                            {
                                                model: ProductionLineModel,
                                                as: "production_line",
                                                attributes: ProductionLineModel
                                                    .getAllFields(),
                                                include: [
                                                    {
                                                        model: LocationsProductionLinesModel,
                                                        as: "location_production_line",
                                                        attributes: LocationsProductionLinesModel
                                                            .getAllFields(),
                                                        include: [
                                                            {
                                                                model: LocationModel,
                                                                as: "location",
                                                                attributes: LocationModel
                                                                    .getAllFields()
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        model: ProductModel,
                                        as: "product",
                                        attributes: ProductModel.getAllFields(),
                                    },
                                    {
                                        model: PurchasedOrderModel,
                                        as: "purchase_order",
                                        attributes: PurchasedOrderModel
                                            .getAllFields(),
                                        include: [
                                            {
                                                model: ClientModel,
                                                as: "client",
                                                attributes: ClientModel
                                                    .getAllFields()
                                            }, {
                                                model: ClientAddressesModel,
                                                as: "client_address",
                                                attributes: ClientAddressesModel
                                                    .getAllFields()
                                            }
                                        ]
                                    },
                                ]
                            },
                            {
                                model: LocationModel,
                                as: "location",
                                required: false,
                                attributes: LocationModel.getAllFields(),
                            }
                        ]
                    },
                ]
            });
            if (!response) {
                res.status(200).json([]);
                return;
            }
            const [shippingOrder] = await formatImagesDeepRecursive([response], ["load_evidence", "path"]);
            res.status(200).json(shippingOrder);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ShippingOrderModel.findByPk(id);
            if (!response) {
                res.status(200).json([]);
                return;
            }
            const [shippingOrder] = await formatWith64Multiple([response], "load_evidence");
            res.status(200).json(shippingOrder);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    };
    static getByCode = async (req, res, next) => {
        const { code } = req.params;
        try {
            const response = await ShippingOrderModel
                .findOne({ where: { code: code } });
            if (!response) {
                res.status(200).json({
                    validation: "Shipping order not found"
                });
                return;
            }
            const shippingOrder = response.toJSON();
            res.status(200).json(shippingOrder);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { status, carrier_id, load_evidence, delivery_cost, delivery_date, shipping_date } = req.body;
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS
                .REPEATABLE_READ
        });
        try {
            const validateCarrier = await CarrierModel.findByPk(carrier_id, { transaction });
            if (!validateCarrier) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(404).json({
                    validation: `The assigned carrier does`
                        + ` not exist`
                });
                return;
            }
            const codeObject = await sequelize.query(`SELECT func_generate_next_shipping_order_code()`
                + ` AS code;`, {
                type: QueryTypes.SELECT,
                transaction
            });
            const new_code = codeObject.shift()?.code;
            const response = await ShippingOrderModel.create({
                code: new_code,
                status: status || "released",
                carrier_id,
                load_evidence: load_evidence || null,
                delivery_cost,
                delivery_date,
                shipping_date
            }, { transaction });
            if (!response) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(400).json({
                    validation: `The shipping order could `
                        + `not be created`
                });
                return;
            }
            await transaction.commit();
            res.status(201).json({
                message: "Shipping order created succefally"
            });
        }
        catch (error) {
            await transaction.rollback();
            await deleteLoadEvidences(load_evidence);
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validatedShippingOrder = await ShippingOrderModel.findByPk(id);
            if (!validatedShippingOrder) {
                res.status(404).json({
                    validation: "Shipping order not found"
                });
                return;
            }
            const relationship = validatedShippingOrder.toJSON();
            const editableFields = ShippingOrderModel
                .getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length > 0) {
                if (update_values?.carrier_id) {
                    const validateCarrier = await CarrierModel.findByPk(update_values.carrier_id);
                    if (!validateCarrier) {
                        res.status(404).json({
                            validation: `The assigned carrier_id `
                                + `does not exist`
                        });
                        return;
                    }
                }
                if (update_values?.load_evidence) {
                    const evidence = relationship?.load_evidence;
                    if (evidence) {
                        await Promise.all(evidence.map((element) => ImageHandler
                            .removePathIfExists(element.path)));
                    }
                }
                const response = await ShippingOrderModel.update(update_values, {
                    where: { id: id },
                    individualHooks: true
                });
                if (!(response[0] > 0)) {
                    res.status(200).json({
                        validation: `No changes were made to the`
                            + ` shipping order`
                    });
                    return;
                }
            }
            res.status(200).json({
                message: "shipping order updated succefally"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    };
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validatedShippingOrder = await ShippingOrderModel.findByPk(id);
            if (!validatedShippingOrder) {
                res.status(404).json({
                    validation: "Shipping order does not exist"
                });
                return;
            }
            const shippingOrder = validatedShippingOrder.toJSON();
            const evidence = shippingOrder.load_evidence || [];
            await deleteLoadEvidences(evidence);
            const response = await ShippingOrderModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (response < 1) {
                res.status(200).json({
                    validation: "Shipping order not found for deleted"
                });
                return;
            }
            res.status(200).json({
                message: "Shipping order deleted succefally"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static createComplete = async (req, res, next) => {
        const body = req.body;
        const { status, carrier_id, load_evidence, delivery_cost, shipping_order_purchase_order_product, delivery_date, shipping_date, tracking_number, shipment_type, transport_method, comments, carrier, load_evidence_deleted, shipping_order_purchase_order_product_aux, } = body;
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS
                .READ_COMMITTED
        });
        try {
            const validateCarrier = await CarrierModel.findByPk(Number(carrier_id), { transaction });
            if (!validateCarrier) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(404).json({
                    validation: "The assigned carrier does not exist"
                });
                return;
            }
            // ? **** GENERACION DEL CODIGO DE LA ORDEN DE ENVIO ****
            const codeObject = await sequelize.query(`SELECT func_generate_next_shipping_order_code()`
                + ` AS code;`, {
                type: QueryTypes.SELECT
            });
            const new_code = codeObject.shift()?.code;
            // ? **** CREACION DE LA ORDEN DE ENVIO ****
            const response = await ShippingOrderModel.create({
                code: new_code,
                status: status || "released",
                carrier_id: Number(carrier_id),
                load_evidence: load_evidence || null,
                delivery_cost: Number(delivery_cost),
                delivery_date,
                shipping_date,
                tracking_number,
                shipment_type,
                transport_method,
                comments
            }, { transaction });
            if (!response) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(404).json({
                    validation: "The shipping order could not be created"
                });
                return;
            }
            const shipping = response.toJSON();
            // ? **** VALIDAR QUE TODAS LAS POPS EXISTEN ****
            const purchase_order_products = shipping_order_purchase_order_product || [];
            const pop = purchase_order_products.map(({ id, ...rest }) => ({
                ...rest,
                shipping_order_id: shipping.id,
            }));
            const popsiD = pop.map(p => p.purchase_order_product_id);
            const popQty = pop.map(p => p.qty);
            const validatePurchasedOrderProducts = await PurchaseOrderProductModel.findAll({
                where: { id: popsiD },
                transaction
            });
            if (validatePurchasedOrderProducts.length
                !== popsiD.length) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(404).json({
                    validation: `Some of the assigned purchase order `
                        + `products do not exist`
                });
                return;
            }
            if (popQty.some(q => q <= 0)) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(400).json({
                    validation: `The assigned purchase order product`
                        + ` quantity for the shipping order `
                        + `must be greater than zero`
                });
                return;
            }
            // ? **** VALIDAR QUE LAS POPS PERTENECEN A LA MISMA LOCALIZACION, CLIENTE Y LA MISMA DIRECCION DE ENVIO ****
            const popsDetailsResponse = await PurchaseOrderProductModel.findAll({
                where: {
                    id: {
                        [Op.in]: popsiD
                    }
                },
                attributes: PurchaseOrderProductModel
                    .getAllFields(),
                include: [
                    {
                        model: PurchasedOrderModel,
                        as: "purchase_order",
                        attributes: PurchasedOrderModel
                            .getAllFields()
                    },
                    {
                        model: PurchasedOrdersProductsLocationsProductionLinesModel,
                        as: "purchase_order_product_location_production_line",
                        attributes: PurchasedOrdersProductsLocationsProductionLinesModel
                            .getAllFields(),
                        include: [{
                                model: ProductionLineModel,
                                as: "production_line",
                                attributes: ProductionLineModel
                                    .getAllFields(),
                                include: [{
                                        model: LocationsProductionLinesModel,
                                        as: "location_production_line",
                                        attributes: LocationsProductionLinesModel
                                            .getAllFields()
                                    }]
                            }]
                    },
                    {
                        model: ShippingOrderPurchaseOrderProductModel,
                        as: "shipping_order_purchase_order_product",
                        attributes: ShippingOrderPurchaseOrderProductModel
                            .getAllFields()
                    }
                ],
                transaction
            });
            const popsDetails = popsDetailsResponse.map(p => p.toJSON());
            const popOfPopsDetails = [...popsDetails].shift();
            const allSameClient = popsDetails.every(p => p.purchase_order?.client_id ===
                popOfPopsDetails?.purchase_order?.client_id);
            const allSameAddress = popsDetails.every(p => p.purchase_order?.client_address_id ===
                popOfPopsDetails?.purchase_order?.client_address_id);
            const allSameLocation = popsDetails.every(p => p.purchase_order_product_location_production_line
                ?.production_line?.location_production_line?.location_id ===
                popOfPopsDetails
                    ?.purchase_order_product_location_production_line
                    ?.production_line?.location_production_line?.location_id);
            if (!allSameClient) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(400).json({
                    validation: `The purchase order product does not belong`
                        + `to the same client as the shipping order`
                });
                return;
            }
            if (!allSameAddress) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(400).json({
                    validation: `The purchase order product does not belong`
                        + `to the same client address as the shipping order`
                });
                return;
            }
            // if (!allSameLocation) {
            //     await transaction.rollback();
            //     await deleteLoadEvidences(load_evidence || []);
            //     res.status(400).json({
            //         validation:
            //             `The purchase order product does not belong`
            //             + `to the same location as the shipping order`
            //     });
            //     return;
            // }
            // ? **** VALIDAR QUE LA CANTIDAD SOLICITADA NO EXCEDE LA CANTIDAD DISPONIBLE ****
            for (const p of popsDetails) {
                const qty_real_pop = p.qty;
                const qty_shipped_pop = p.shipping_order_purchase_order_product
                    ?.reduce((acc, value) => acc + value.qty, 0) || 0;
                const qty_request = pop.find(po => po.purchase_order_product_id === p.id)?.qty || 0;
                if (qty_request + qty_shipped_pop > qty_real_pop) {
                    await transaction?.rollback();
                    res.status(400).json({
                        validation: `The qty "${qty_request}" for the product `
                            + `"${p.product_name}" exceeds the quantity ` +
                            `originaly of the purchase order` +
                            `(${p.purchase_order?.order_code}) "${qty_real_pop}".
                            The qty available for the purchase order is `
                            + `"${qty_real_pop - qty_shipped_pop}"`,
                    });
                    return;
                }
            }
            // ? **** ACTUALIZAR LA LOCALIZACION EN INVENTORY_MOVEMENT ****
            // const filter = pop.filter(
            //     p =>
            //         p.location &&
            //         p.purchase_order_products?.shipping_summary &&
            //         Number(p.purchase_order_products?.purchase_order_product_location_production_line?.production_line?.location_production_line?.location_id)
            //         !== Number(p.location?.id)
            // );
            // console.log(filter);
            // if (filter.length > 0) {
            //     const promises = filter.map(p => {
            //         const response = InventoryMovementModel.update(
            //             {
            //                 location_id: p.location?.id,
            //                 location_name: p.location?.name
            //             },
            //             {
            //                 where: {
            //                     reference_id: p.purchase_order_product_id,
            //                     reference_type: "Order",
            //                     movement_type: "allocate"
            //                 },
            //                 transaction
            //             });
            //         return response;
            //     });
            //     const responseUpdateLocation = await Promise.all(promises);
            //     console.log(responseUpdateLocation);
            //     if (responseUpdateLocation.some(r => r[0] === 0)) {
            //         await transaction.rollback();
            //         await deleteLoadEvidences(load_evidence || []);
            //         res.status(500).json({
            //             validation:
            //                 `The update of the location in the inventory movement `
            //                 + `could not be completed.`
            //         });
            //         return;
            //     }
            // }
            // ? **** ASIGNAR LOS PRODUCTOS DE LA ORDEN DE COMPRA AL ENVIO **** 
            const response2 = await ShippingOrderPurchaseOrderProductModel.bulkCreate(pop, { transaction });
            if (!response2) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(500).json({
                    validation: `The assignment of the purchase order products `
                        + `to the shipping order could not be completed.`
                });
                return;
            }
            const load_evidence_shippingOrder = shipping?.load_evidence || [];
            // obtener la ruta relativa de cada imagen
            const pathImages = load_evidence_shippingOrder?.map((product) => product.path);
            // obtener la ruta obsoluta del directorio padre
            const baseUploadFolder = path.resolve(process.cwd(), 'uploads');
            // obtener la ruta obsoluta de cada imagen
            const absolutePathFiles = pathImages?.map((pathImage) => {
                // normalizar la ruta relativa de cada imagen
                const normalizedPath = path.normalize(pathImage);
                // obtener la ruta obsoluta de cada imagen apartir de la
                // ruta obsoluta del directorio padre
                const relativeAbsolutePath = path.resolve(baseUploadFolder, normalizedPath);
                return relativeAbsolutePath;
            });
            // crear la ruta del directorio por id del registro
            //  de la bd
            const directoryPath = path.resolve(baseUploadFolder, 'shipping-orders', shipping.id.toString());
            try {
                await access(directoryPath, constants.F_OK);
            }
            catch {
                await mkdir(directoryPath, { recursive: true });
            }
            const newPathFiles = absolutePathFiles?.map((sourcePath) => {
                const fileName = path.basename(sourcePath);
                const destinationPath = path.resolve(directoryPath, fileName);
                return {
                    sourcePath,
                    destinationPath
                };
            });
            await Promise.all(newPathFiles?.map(async ({ sourcePath, destinationPath }) => {
                return await fs.rename(sourcePath, destinationPath);
            }) ?? []);
            const relativePathFiles = newPathFiles?.map(({ destinationPath }) => {
                const relativePath = path.relative(baseUploadFolder, destinationPath);
                return relativePath;
            });
            const newLoadEvidence = relativePathFiles?.map((value) => ({
                path: value,
                id: value
            }));
            const updatedShippingOrder = await ShippingOrderModel.update({ load_evidence: newLoadEvidence }, { where: { id: shipping.id }, transaction });
            if (updatedShippingOrder[0] === 0) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence || []);
                res.status(500).json({
                    validation: "The shipping order "
                        + "could not be updated "
                        + "with the new load evidence"
                });
                return;
            }
            await transaction.commit();
            res.status(201).json(shipping);
        }
        catch (error) {
            await transaction?.rollback();
            await deleteLoadEvidences(load_evidence || []);
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    };
    static updateComplete = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS
                .REPEATABLE_READ
        });
        const { id } = req.params;
        const completeBody = req.body;
        let IsDeleteImage = false;
        let isSuccessFully = false;
        try {
            // ? **** OBTENER LOS CAMPOS EDITABLES ****
            const editableFields = ShippingOrderModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, completeBody);
            // ? **** VALIDAMOS QUE LA ORDEN DE ENVIO EXISTA **** */
            const validateShippingOrder = await ShippingOrderModel.findByPk(id);
            if (!validateShippingOrder) {
                await transaction.rollback();
                await deleteLoadEvidences(completeBody.load_evidence || []);
                res.status(404).json({
                    validation: "Shipping order does not exist"
                });
                return;
            }
            const shippingOrder = validateShippingOrder.toJSON();
            // ? **** VALIDAMOS QUE EXISTAN CAMPOS PARA ACTUALIZAR **** */
            if (Object.keys(update_values)?.length > 0) {
                if (update_values?.carrier_id) {
                    const validateCarrier = await CarrierModel.findByPk(update_values.carrier_id, { transaction });
                    if (!validateCarrier) {
                        await transaction?.rollback();
                        await deleteLoadEvidences(completeBody.load_evidence || []);
                        res.status(404).json({
                            validation: "The assigned carrier does not exist"
                        });
                        return;
                    }
                }
            }
            // ? **** VALIDAMOS QUE EXISTAN EVIDENCIAS PARA ELIMINAR **** */
            if (completeBody.load_evidence_deleted && JSON.parse(completeBody.load_evidence_deleted).length > 0)
                IsDeleteImage = true;
            // ? **** TRATAMOS LAS EVIDENCIAS **** */
            let load_evidence_old = (() => {
                try {
                    const raw = completeBody?.load_evidence_old;
                    return typeof raw === 'string' ? JSON.parse(raw) : [];
                }
                catch {
                    return [];
                }
            })();
            let load_evidence_deleted = (() => {
                try {
                    const raw = completeBody?.load_evidence_deleted;
                    return typeof raw === 'string' ? JSON.parse(raw) : [];
                }
                catch {
                    return [];
                }
            })();
            /* convertimos las evidencias nuevas a json */
            const load_evidence_new = update_values?.load_evidence ?? [];
            // convertimos los path del backend(Files) a path(string)
            if (load_evidence_new.length > 0) {
                load_evidence_new.map((e) => e.path = e.id);
            }
            // convertimos las evidencias frontend(path(string)) a path(string)
            if (load_evidence_old.length > 0) {
                load_evidence_old.map((e) => e.path = e.id);
            }
            // eliminamos las evidencias que se desean eliminar
            if (load_evidence_deleted.length > 0) {
                load_evidence_deleted.map((e) => e.path = e.id);
                load_evidence_old = load_evidence_old.filter((e) => !load_evidence_deleted.some((e2) => e2.path === e.path));
            }
            // ? **** ACTUALIZAMOS LA ORDEN DE ENVIO **** */
            const update_values_process = {
                ...update_values,
                shipping_date: coerceValue(update_values.shipping_date),
            };
            const isEvidenceUpdate = completeBody.load_evidence_deleted && JSON.parse(completeBody.load_evidence_deleted).length > 0 ||
                completeBody.load_evidence && JSON.parse(completeBody.load_evidence).length > 0;
            // actualizamos la orden de envio
            const responseUpdate = await ShippingOrderModel.update({
                ...update_values_process,
                ...(isEvidenceUpdate && {
                    load_evidence: [
                        ...load_evidence_old,
                        ...load_evidence_new,
                    ]
                })
            }, {
                where: { id: id },
                transaction
            });
            if (!responseUpdate) {
                await transaction.rollback();
                await deleteLoadEvidences(completeBody.load_evidence || []);
                res.status(500).json({
                    validation: "The shipping order could not be updated"
                });
                return;
            }
            // ? **** ACTUALIZAMOS LOS PRODUCTOS DE LA ORDEN DE ENVIO **** */
            if (completeBody?.shipping_order_purchase_order_product_manager) {
                const sopopManager = JSON.parse(completeBody
                    .shipping_order_purchase_order_product_manager);
                const flagProductsInputsUpdate = [
                    sopopManager.added,
                    sopopManager.deleted,
                    sopopManager.modified
                ].some((p) => p?.length > 0);
                // ? **** VALIDAMOS QUE EXISTAN PRODUCTOS PARA ACTUALIZAR **** */
                if (flagProductsInputsUpdate) {
                    const adds = sopopManager.added;
                    const deletes = sopopManager.deleted;
                    const modified = sopopManager.modified;
                    // ? **** VALIDAMOS QUE EXISTAN PRODUCTOS PARA ELIMINAR **** */
                    if (deletes.length > 0) {
                        const deletedFiltered = deletes.filter(d => d.id !== undefined);
                        const existingSopopsResponse = await ShippingOrderPurchaseOrderProductModel.findAll({
                            where: {
                                id: { [Op.in]: deletedFiltered.map(d => d.id) }
                            }, transaction,
                            lock: transaction.LOCK.SHARE,
                        });
                        if (existingSopopsResponse.length
                            !== deletedFiltered.length) {
                            await transaction.rollback();
                            await deleteLoadEvidences(completeBody.load_evidence || []);
                            res.status(404).json({
                                validation: `Some products of the shipping order you`
                                    + ` are trying to delete do not exist`,
                            });
                            return;
                        }
                        const responseDelete = await ShippingOrderPurchaseOrderProductModel
                            .destroy({
                            where: {
                                id: {
                                    [Op.in]: deletedFiltered.map(d => d.id)
                                }
                            },
                            transaction
                        });
                        if (!responseDelete) {
                            await transaction.rollback();
                            await deleteLoadEvidences(completeBody.load_evidence || []);
                            res.status(400).json({
                                validation: `The purchased order products of the `
                                    + `shipping order could not be deleted`
                            });
                            return;
                        }
                    }
                    // ? **** VALIDAMOS QUE EXISTAN PRODUCTOS PARA MODIFICAR **** */
                    if (modified.length > 0) {
                        const modifiedFiltered = modified.filter(d => d.id !== undefined);
                        const sopopiD = modifiedFiltered.map(d => d.id);
                        const existingSopopsResponse = await ShippingOrderPurchaseOrderProductModel.findAll({
                            where: {
                                id: { [Op.in]: sopopiD }
                            }, transaction,
                            lock: transaction.LOCK.SHARE,
                        });
                        if (existingSopopsResponse.length
                            !== modifiedFiltered.length) {
                            await transaction.rollback();
                            await deleteLoadEvidences(completeBody.load_evidence || []);
                            res.status(404).json({
                                validation: `Some products of the shipping order you`
                                    + ` are trying to modify do not exist`,
                            });
                            return;
                        }
                        const sopopsJson = existingSopopsResponse.map(sopop => sopop.toJSON());
                        const popsiD = sopopsJson.map(sopop => sopop.purchase_order_product_id);
                        const popsDetailsResponse = await PurchaseOrderProductModel.findAll({
                            where: {
                                id: {
                                    [Op.in]: popsiD
                                }
                            },
                            attributes: PurchaseOrderProductModel
                                .getAllFields(),
                            include: [
                                {
                                    model: PurchasedOrderModel,
                                    as: "purchase_order",
                                    attributes: PurchasedOrderModel
                                        .getAllFields()
                                },
                                {
                                    model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                    as: "purchase_order_product_location_production_line",
                                    attributes: PurchasedOrdersProductsLocationsProductionLinesModel
                                        .getAllFields(),
                                    include: [{
                                            model: ProductionLineModel,
                                            as: "production_line",
                                            attributes: ProductionLineModel
                                                .getAllFields(),
                                            include: [{
                                                    model: LocationsProductionLinesModel,
                                                    as: "location_production_line",
                                                    attributes: LocationsProductionLinesModel
                                                        .getAllFields()
                                                }]
                                        }]
                                },
                                {
                                    model: ShippingOrderPurchaseOrderProductModel,
                                    as: "shipping_order_purchase_order_product",
                                    attributes: ShippingOrderPurchaseOrderProductModel
                                        .getAllFields()
                                }
                            ],
                            transaction
                        });
                        const new_pops = [...popsDetailsResponse].map(m => m.toJSON());
                        // console.log(`modifiedFiltered:`, modifiedFiltered);
                        // const filter = modifiedFiltered.filter(
                        //     p => p.location && Number(p.purchase_order_products?.inventory_commited?.location_id)
                        //         !== Number(p.location?.id)
                        // );
                        // console.log(`filter:`, filter);
                        // if (filter.length > 0) {
                        //     const sopopsWithPops = filter.map(p => {
                        //         const pop = new_pops.find(pop => pop.shipping_order_purchase_order_product?.find(sopop => sopop.id === p.id));
                        //         return {
                        //             ...p,
                        //             purchase_order_product_id: pop?.id
                        //         }
                        //     });
                        //     const promises = sopopsWithPops.map(p => {
                        //         const response = InventoryMovementModel.update(
                        //             {
                        //                 location_id: p.location?.id,
                        //                 location_name: p.location?.name
                        //             },
                        //             {
                        //                 where: {
                        //                     reference_id: p.purchase_order_product_id,
                        //                     reference_type: "Order",
                        //                     movement_type: "allocate"
                        //                 },
                        //                 transaction
                        //             },
                        //         );
                        //         return response;
                        //     });
                        //     const responseUpdateLocation = await Promise.all(promises);
                        //     if (responseUpdateLocation.some(r => r[0] === 0)) {
                        //         await transaction.rollback();
                        //         await deleteLoadEvidences(completeBody.load_evidence || []);
                        //         console.log(`Aqui trueno`);
                        //         res.status(500).json({
                        //             validation:
                        //                 `The update of the location in the inventory movement `
                        //                 + `could not be completed.`
                        //         });
                        //         return;
                        //     }
                        // }
                        for (const p of new_pops) {
                            const editableFieldsSOPOP = ShippingOrderPurchaseOrderProductModel.getEditableFields();
                            const qty_real_pop = p.qty;
                            const qty_shipped_pop = p.shipping_order_purchase_order_product
                                ?.reduce((acc, value) => acc + value.qty, 0) || 0;
                            const qty_pop_old = p.shipping_order_purchase_order_product
                                ?.find(po => po.purchase_order_product_id === p.id)
                                ?.qty || 0;
                            const update_values = modifiedFiltered
                                .find(po => +po.purchase_order_product_id
                                === p.id);
                            const qty_request = update_values?.qty || 0;
                            if ((qty_request + (qty_shipped_pop - qty_pop_old)) > qty_real_pop) {
                                await transaction?.rollback();
                                await deleteLoadEvidences(completeBody.load_evidence);
                                res.status(400).json({
                                    validation: `The qty "${qty_request}" for the product `
                                        + `"${p.product_name}" exceeds the quantity ` +
                                        `originaly of the purchase order` +
                                        `(${p.purchase_order?.order_code}) "${qty_real_pop}".
                                        The qty available for the purchase order is `
                                        + `"${qty_real_pop - (qty_shipped_pop - qty_pop_old)}"`,
                                });
                                return;
                            }
                            const sopops = existingSopopsResponse.map(m => m.toJSON());
                            const sopop = sopops.find(po => po.purchase_order_product_id === p.id);
                            const sopop_update = modifiedFiltered.find(po => po.id === sopop?.id);
                            const updateValuesSOPOP = collectorUpdateFields(editableFieldsSOPOP, sopop_update);
                            if (Object.keys(updateValuesSOPOP).length > 0) {
                                const update = await ShippingOrderPurchaseOrderProductModel
                                    .update(updateValuesSOPOP, {
                                    where: {
                                        id: sopop?.id
                                    },
                                    transaction
                                });
                                if (!(update[0] > 0)) {
                                    await transaction?.rollback();
                                    await deleteLoadEvidences(completeBody.load_evidence);
                                    res.status(400).json({
                                        validation: `The purchase order product of `
                                            + `the shipping order`
                                            + `could not be updated`
                                    });
                                    return;
                                }
                            }
                        }
                    }
                    // ? **** VALIDAMOS QUE EXISTAN PRODUCTOS PARA AGREGAR **** */
                    if (adds.length > 0) {
                        const addsFiltered = adds;
                        const popsiD = addsFiltered.map(d => d.purchase_order_product_id);
                        // ? **** VALIDAMOS QUE EXISTAN LOS POPS A AGERGAR **** */
                        const existingSopopsResponse = await PurchaseOrderProductModel.findAll({
                            where: {
                                id: { [Op.in]: popsiD }
                            }, transaction,
                            lock: transaction.LOCK.SHARE,
                        });
                        if (existingSopopsResponse.length
                            !== addsFiltered.length) {
                            await transaction.rollback();
                            await deleteLoadEvidences(completeBody.load_evidence);
                            res.status(404).json({
                                validation: `Some purchase order products of the `
                                    + `shipping order you`
                                    + ` are trying to add do not exist`,
                            });
                            return;
                        }
                        // ? **** OBTENEMOS LAS SOPOPS ASOCIADAS AL ENVIO, PARA OBTENER UNA REFERENCIA DEL CLIENTE, LA DIRECCION Y LA UBICACION **** */
                        const validateShippingOrderClientOnShippingOrder = await ShippingOrderPurchaseOrderProductModel.findAll({
                            where: { shipping_order_id: id },
                            attributes: ShippingOrderPurchaseOrderProductModel
                                .getAllFields(),
                            include: [{
                                    model: PurchaseOrderProductModel,
                                    as: "purchase_order_products",
                                    include: [
                                        {
                                            model: PurchasedOrderModel,
                                            as: "purchase_order",
                                            attributes: PurchasedOrderModel
                                                .getAllFields()
                                        },
                                        {
                                            model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                            as: "purchase_order_product_location_production_line",
                                            attributes: PurchasedOrdersProductsLocationsProductionLinesModel
                                                .getAllFields(),
                                            include: [{
                                                    model: ProductionLineModel,
                                                    attributes: ProductionLineModel.getAllFields(),
                                                    as: "production_line",
                                                    include: [{
                                                            model: LocationsProductionLinesModel,
                                                            as: "location_production_line",
                                                            attributes: LocationsProductionLinesModel
                                                                .getAllFields()
                                                        }]
                                                }]
                                        }
                                    ]
                                }],
                            transaction
                        });
                        // ? **** OBTENEMOS LOS POPS A DETALLE PARA ANALIZAR LA AGREGACION **** */
                        const popsDetailsResponse = await PurchaseOrderProductModel.findAll({
                            where: {
                                id: {
                                    [Op.in]: popsiD
                                }
                            },
                            attributes: PurchaseOrderProductModel
                                .getAllFields(),
                            include: [
                                {
                                    model: PurchasedOrderModel,
                                    as: "purchase_order",
                                    attributes: PurchasedOrderModel
                                        .getAllFields()
                                },
                                {
                                    model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                    as: "purchase_order_product_location_production_line",
                                    attributes: PurchasedOrdersProductsLocationsProductionLinesModel
                                        .getAllFields(),
                                    include: [{
                                            model: ProductionLineModel,
                                            as: "production_line",
                                            attributes: ProductionLineModel
                                                .getAllFields(),
                                            include: [{
                                                    model: LocationsProductionLinesModel,
                                                    as: "location_production_line",
                                                    attributes: LocationsProductionLinesModel
                                                        .getAllFields()
                                                }]
                                        }]
                                },
                                {
                                    model: ShippingOrderPurchaseOrderProductModel,
                                    as: "shipping_order_purchase_order_product",
                                    attributes: ShippingOrderPurchaseOrderProductModel
                                        .getAllFields()
                                }
                            ],
                            transaction
                        });
                        // ? **** PROCESAMOS LAS SOPOPS EN FORMATO JSON, Y TOMAMOS UNA COMO REFERENCIA **** */
                        const sopopsInShippingOrder = validateShippingOrderClientOnShippingOrder
                            .map(m => m.toJSON());
                        const pop_test_from_sopops = [...sopopsInShippingOrder].shift();
                        // ? **** OBTENEMOS LOS POPS A AGREGAR YA EN FORMATO JSON **** */
                        const new_pops = [...popsDetailsResponse].map(m => m.toJSON());
                        // ? **** ANALIZAMOS SI TODOS LOS POPS TIENEN EL MISMO CLIENTE, DIRECCION, Y LOCALIZACION **** */
                        const allSameClient = new_pops.every(p => p.purchase_order?.client_id ===
                            pop_test_from_sopops
                                ?.purchase_order_products
                                ?.purchase_order
                                ?.client_id);
                        const allSameAddress = new_pops.every(p => p.purchase_order?.client_address_id ===
                            pop_test_from_sopops
                                ?.purchase_order_products
                                ?.purchase_order
                                ?.client_address_id);
                        // const allSameLocation: boolean =
                        //     new_pops.every(p =>
                        //         p.purchase_order_product_location_production_line
                        //             ?.production_line
                        //             ?.location_production_line
                        //             ?.location_id ===
                        //         pop_test_from_sopops
                        //             ?.purchase_order_products
                        //             ?.purchase_order_product_location_production_line
                        //             ?.production_line
                        //             ?.location_production_line
                        //             ?.location_id
                        //     );
                        if (!allSameClient) {
                            await transaction.rollback();
                            await deleteLoadEvidences(completeBody.load_evidence);
                            res.status(400).json({
                                validation: "The purchase order product does not belong"
                                    + "to the same client as the shipping order"
                            });
                            return;
                        }
                        if (!allSameAddress) {
                            await transaction.rollback();
                            await deleteLoadEvidences(completeBody.load_evidence);
                            res.status(400).json({
                                validation: "The purchase order product does not belong"
                                    + "to the same client address as the shipping order"
                            });
                            return;
                        }
                        // if (!allSameLocation) {
                        //     await transaction.rollback();
                        //     await deleteLoadEvidences(
                        //         completeBody.load_evidence
                        //     );
                        //     res.status(400).json({
                        //         validation:
                        //             "The purchase order product does not belong"
                        //             + "to the same location as the shipping order"
                        //     });
                        //     return;
                        // }
                        // ? *** ACTUALIZAMOS LA UBICACION EN EL INVENTARIO SI LO REQUIERE **** */
                        // const filter = addsFiltered.filter(
                        //     p => {
                        //         const location_asigned = Number(p.purchase_order_products?.purchase_order_product_location_production_line?.production_line?.location_production_line?.location_id);
                        //         const location_current = Number(p.location?.id);
                        //         return location_asigned !== location_current;
                        //     }
                        // );
                        // if (filter.length > 0) {
                        //     const promises = filter.map(p => {
                        //         const response = InventoryMovementModel.update(
                        //             {
                        //                 location_id: p.location?.id,
                        //                 location_name: p.location?.name
                        //             },
                        //             {
                        //                 where: {
                        //                     reference_id: p.purchase_order_product_id,
                        //                     reference_type: "Order",
                        //                     movement_type: "allocate"
                        //                 },
                        //                 transaction
                        //             });
                        //         return response;
                        //     });
                        //     const responseUpdateLocation = await Promise.all(promises);
                        //     if (responseUpdateLocation.some(r => r[0] === 0)) {
                        //         await transaction.rollback();
                        //         await deleteLoadEvidences(completeBody.load_evidence || []);
                        //         res.status(500).json({
                        //             validation:
                        //                 `The update of the location in the inventory movement `
                        //                 + `could not be completed.`
                        //         });
                        //         return;
                        //     }
                        // }
                        // ? **** VALIDAMOS QUE LOS POPS NO EXCEDAN LA CANTIDAD ORIGINAL ORDENADA **** */
                        for (const p of new_pops) {
                            const qty_real_pop = p.qty;
                            const qty_shipped_pop = p.shipping_order_purchase_order_product
                                ?.reduce((acc, value) => acc + value.qty, 0) || 0;
                            const qty_pop_old = p.shipping_order_purchase_order_product
                                ?.find(po => po.purchase_order_product_id === p.id)
                                ?.qty || 0;
                            const update_values = addsFiltered
                                .find(po => +po.purchase_order_product_id
                                === p.id);
                            const qty_request = update_values?.qty || 0;
                            if ((qty_request + (qty_shipped_pop - qty_pop_old)) > qty_real_pop) {
                                await transaction?.rollback();
                                await deleteLoadEvidences(completeBody.load_evidence);
                                res.status(400).json({
                                    validation: `The qty "${qty_request}" for the product `
                                        + `"${p.product_name}" exceeds the quantity` +
                                        `originaly of the purchase order` +
                                        `(${p.purchase_order?.order_code}) "${qty_real_pop}".
                                    The qty available for the purchase order is `
                                        + `"${qty_real_pop - (qty_shipped_pop - qty_pop_old)}"`,
                                });
                                return;
                            }
                            const found = addsFiltered.find(p => p.id === p.id);
                            if (!found) {
                                throw new Error('POP no encontrado para crear ShippingOrderPurchaseOrderProduct');
                            }
                            const new_sopop = {
                                ...found,
                                shipping_order_id: shippingOrder.id
                            };
                            const responseCreate = await ShippingOrderPurchaseOrderProductModel
                                .create(new_sopop, { transaction });
                            if (!responseCreate) {
                                await transaction?.rollback();
                                await deleteLoadEvidences(completeBody.load_evidence);
                                res.status(400).json({
                                    validation: `The purchase order product of`
                                        + ` the shipping order`
                                        + `could not be updated`
                                });
                                return;
                            }
                        }
                    }
                }
            }
            await transaction.commit();
            isSuccessFully = true;
            res.status(201).json({
                message: "Shipping order updated successfully"
            });
        }
        catch (error) {
            await transaction.rollback();
            await deleteLoadEvidences(completeBody.load_evidence);
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error `
                    + `ocurred ${error} `);
            }
        }
        finally {
            if (IsDeleteImage && isSuccessFully) {
                const load_evidence_deleted = JSON.parse(completeBody.load_evidence_deleted);
                const evidence_delete = load_evidence_deleted.map((item) => {
                    return {
                        path: item.id,
                        id: item.id
                    };
                });
                await deleteLoadEvidences(evidence_delete);
            }
        }
    };
    static load = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS
                .REPEATABLE_READ
        });
        const { id } = req.params;
        const completeBody = req.body;
        let IsDeleteImage = false;
        let isSuccessFully = false;
        try {
            const editableFields = ShippingOrderModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, completeBody);
            const validateShippingOrder = await ShippingOrderModel.findByPk(id);
            /* validamos que la orden de envio exista */
            if (!validateShippingOrder) {
                await transaction.rollback();
                await deleteLoadEvidences(completeBody.load_evidence || []);
                res.status(404).json({
                    validation: "Shipping order does not exist"
                });
                return;
            }
            /* convertimos la orden obtenida a json */
            const shippingOrder = validateShippingOrder.toJSON();
            /* validamos que existan campos para actualizar */
            if (Object.keys(update_values)?.length > 0) {
                if (update_values?.carrier_id) {
                    const validateCarrier = await CarrierModel.findByPk(update_values.carrier_id, { transaction });
                    if (!validateCarrier) {
                        await transaction?.rollback();
                        await deleteLoadEvidences(completeBody.load_evidence || []);
                        res.status(404).json({
                            validation: "The assigned carrier does not exist"
                        });
                        return;
                    }
                }
            }
            /* validamos que existan evidencias para eliminar */
            if (completeBody.load_evidence_deleted && JSON.parse(completeBody.load_evidence_deleted).length > 0)
                IsDeleteImage = true;
            /* convertimos las evidencias antiguas a json */
            let load_evidence_old = (() => {
                try {
                    const raw = completeBody?.load_evidence_old;
                    return typeof raw === 'string' ? JSON.parse(raw) : [];
                }
                catch {
                    return [];
                }
            })();
            let load_evidence_deleted = (() => {
                try {
                    const raw = completeBody?.load_evidence_deleted;
                    return typeof raw === 'string' ? JSON.parse(raw) : [];
                }
                catch {
                    return [];
                }
            })();
            /* convertimos las evidencias nuevas a json */
            const load_evidence_new = update_values?.load_evidence ?? [];
            // convertimos los path del backend(Files) a path(string)
            if (load_evidence_new.length > 0) {
                load_evidence_new.map((e) => e.path = e.id);
            }
            // convertimos las evidencias frontend(path(string)) a path(string)
            if (load_evidence_old.length > 0) {
                load_evidence_old.map((e) => e.path = e.id);
            }
            // eliminamos las evidencias que se desean eliminar
            if (load_evidence_deleted.length > 0) {
                load_evidence_deleted.map((e) => e.path = e.id);
                load_evidence_old = load_evidence_old.filter((e) => !load_evidence_deleted.some((e2) => e2.path === e.path));
            }
            // actualizamos la orden de envio
            const responseUpdate = await ShippingOrderModel.update({
                ...update_values,
                load_evidence: [
                    ...load_evidence_old,
                    ...load_evidence_new,
                ],
                status: "shipping"
            }, {
                where: { id: id },
                transaction
            });
            if (!responseUpdate) {
                await transaction.rollback();
                await deleteLoadEvidences(completeBody.load_evidence || []);
                res.status(500).json({
                    validation: "The shipping order could not be updated"
                });
                return;
            }
            await transaction.commit();
            isSuccessFully = true;
            res.status(201).json({
                message: "Shipping order updated successfully"
            });
        }
        catch (error) {
            await transaction.rollback();
            await deleteLoadEvidences(completeBody.load_evidence);
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error `
                    + `ocurred ${error} `);
            }
        }
        finally {
            if (IsDeleteImage && isSuccessFully) {
                const load_evidence_deleted = JSON.parse(completeBody.load_evidence_deleted);
                const evidence_delete = load_evidence_deleted.map((item) => {
                    return {
                        path: item.id,
                        id: item.id
                    };
                });
                await deleteLoadEvidences(evidence_delete);
            }
        }
    };
}
export default ShippingOrderController;
