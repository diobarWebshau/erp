import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import ShippingOrderModel
    from "../models/references/ShippingOrders.model.js";
import type {
    LoadEvidenceItem,
    ShippingOrderCreationAttributes,
    ShippingOrderAttributes,
    PartialLoadEvidenceItem
} from "../models/references/ShippingOrders.model.js";
import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    QueryTypes,
    Transaction
} from "sequelize";
import CarrierModel
    from "../models/base/Carriers.model.js";
import ImageHandler
    from "../../../../classes/ImageHandler.js";
import {
    formatImagesDeepRecursive,
    formatWith64Multiple
} from "../../../../scripts/formatWithBase64.js";
import {
    PurchaseOrderProductModel,
    PurchasedOrderModel,
    PurchasedOrdersProductsLocationsProductionLinesModel,
    ProductionLineModel, LocationsProductionLinesModel,
    ShippingOrderPurchaseOrderProductModel,
    ClientModel,
    ClientAddressesModel,
    LocationModel,
} from "../../../associations.js";
import {
    ShippingOrderPurchaseOrderProductAttributes,
    ShippingOrderPurchaseOrderProductCreateAttributes,
    ShippingOrderPurchaseOrderProductManager
} from "../../../types.js";
import sequelize
    from "../../../../mysql/configSequelize.js";
import {
    Op
} from "sequelize";
import path from 'node:path';
import fs, { constants, mkdir, access } from "node:fs/promises"

const deleteLoadEvidences = async (
    evidences: LoadEvidenceItem[] | undefined
): Promise<void> => {
    if (!Array.isArray(evidences) || evidences.length === 0) return;

    await Promise.allSettled(
        evidences.map((evidence) =>
            ImageHandler.removeImageIfExists(evidence.path)
        )
    );
};

class ShippingOrderController {

    static getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const response =
                await ShippingOrderModel.findAll();
            if (response.length < 1) {
                res.status(200).json({
                    validation:
                        "Shipping orders no found"
                });
                return;
            }
            const shippingOrders =
                await formatWith64Multiple(
                    response,
                    "load_evidence",
                    "path"
                );

            res.status(200).json(shippingOrders);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error `
                    + `occurred: ${error}`);
            }
        }
    }


    static getDetailsById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        try {
            const response =
                await ShippingOrderModel.findOne({
                    where: { id },
                    attributes:
                        ShippingOrderModel
                            .getAllFields(),
                    include: [
                        {
                            model:
                                ShippingOrderPurchaseOrderProductModel,
                            as: "shipping_order_purchase_order_product",
                            attributes:
                                ShippingOrderPurchaseOrderProductModel
                                    .getAllFields(),
                            include: [
                                {
                                    model:
                                        PurchaseOrderProductModel,
                                    as: "purchase_order_products",
                                    attributes:
                                        PurchaseOrderProductModel
                                            .getAllFields(),
                                    include: [
                                        {
                                            model:
                                                PurchasedOrderModel,
                                            as: "purchase_order",
                                            attributes:
                                                PurchasedOrderModel
                                                    .getAllFields(),
                                            include: [
                                                {
                                                    model:
                                                        ClientModel,
                                                    as: "client",
                                                    attributes:
                                                        ClientModel
                                                            .getAllFields()
                                                }, {
                                                    model: ClientAddressesModel,
                                                    as: "client_address",
                                                    attributes:
                                                        ClientAddressesModel
                                                            .getAllFields()
                                                }
                                            ]
                                        },
                                        {
                                            model:
                                                PurchasedOrdersProductsLocationsProductionLinesModel,
                                            as:
                                                "purchase_order_product_location_production_line",
                                            attributes:
                                                PurchasedOrdersProductsLocationsProductionLinesModel
                                                    .getAllFields(),
                                            include: [
                                                {
                                                    model:
                                                        ProductionLineModel,
                                                    as:
                                                        "production_line",
                                                    attributes:
                                                        ProductionLineModel
                                                            .getAllFields(),
                                                    include: [
                                                        {
                                                            model:
                                                                LocationsProductionLinesModel,
                                                            as:
                                                                "location_production_line",
                                                            attributes:
                                                                LocationsProductionLinesModel
                                                                    .getAllFields(),
                                                            include: [
                                                                {
                                                                    model:
                                                                        LocationModel,
                                                                    as:
                                                                        "location",
                                                                    attributes:
                                                                        LocationModel
                                                                            .getAllFields()
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {

                            model: CarrierModel,
                            as: "carrier",
                            attributes:
                                CarrierModel
                                    .getAllFields()
                        }
                    ]
                });

            if (!response) {
                res.status(200).json([]);
                return;
            }
            const [shippingOrder] =
                await formatImagesDeepRecursive(
                    [response],
                    ["load_evidence", "path"]
                );
            res.status(200).json(shippingOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    }


    static getById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        try {
            const response =
                await ShippingOrderModel.findByPk(id);
            if (!response) {
                res.status(200).json([]);
                return;
            }
            const [shippingOrder] =
                await formatWith64Multiple(
                    [response],
                    "load_evidence"
                );
            res.status(200).json(shippingOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    }
    static getByCode = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const { code } = req.params;
        try {
            const response =
                await ShippingOrderModel
                    .findOne({ where: { code: code } });
            if (!response) {
                res.status(200).json({
                    validation:
                        "Shipping order not found"
                });
                return;
            }
            const shippingOrder =
                response.toJSON();
            res.status(200).json(shippingOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`);
            }
        }
    }
    static create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {
            status, carrier_id,
            load_evidence, delivery_cost,
            delivery_date, shipping_date
        } = req.body;

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

        try {

            const validateCarrier =
                await CarrierModel.findByPk(carrier_id, { transaction });
            if (!validateCarrier) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(404).json({
                    validation:
                        `The assigned carrier does`
                        + ` not exist`
                });
                return;
            }

            const codeObject: { code: string }[] =
                await sequelize.query(
                    `SELECT func_generate_next_shipping_order_code()`
                    + ` AS code;`,
                    {
                        type: QueryTypes.SELECT,
                        transaction
                    }
                );

            const new_code: string =
                codeObject.shift()?.code as string;

            const response =
                await ShippingOrderModel.create({
                    code: new_code,
                    status: status || "released",
                    carrier_id,
                    load_evidence:
                        load_evidence || null,
                    delivery_cost,
                    delivery_date,
                    shipping_date
                }, { transaction });

            if (!response) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(400).json({
                    validation:
                        `The shipping order could `
                        + `not be created`
                });
                return;
            }

            await transaction.commit();

            res.status(201).json({
                message:
                    "Shipping order created succefally"
            })
        } catch (error: unknown) {
            await transaction.rollback();
            await deleteLoadEvidences(load_evidence);
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`
                );
            }
        }
    }


    static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validatedShippingOrder =
                await ShippingOrderModel.findByPk(id);
            if (!validatedShippingOrder) {
                res.status(404).json({
                    validation:
                        "Shipping order not found"
                });
                return;
            }
            const relationship =
                validatedShippingOrder.toJSON();
            const editableFields =
                ShippingOrderModel
                    .getEditableFields();
            const update_values =
                collectorUpdateFields(
                    editableFields,
                    body
                );
            if (Object.keys(update_values).length > 0) {
                if (update_values?.carrier_id) {
                    const validateCarrier =
                        await CarrierModel.findByPk(
                            update_values.carrier_id
                        );
                    if (!validateCarrier) {
                        res.status(404).json({
                            validation:
                                `The assigned carrier_id `
                                + `does not exist`
                        });
                        return;
                    }
                }
                if (update_values?.load_evidence) {
                    const evidence =
                        relationship?.load_evidence;
                    if (evidence) {
                        await Promise.all(
                            evidence.map((element) =>
                                ImageHandler
                                    .removePathIfExists(element.path)
                            )
                        );
                    }
                }


                const response =
                    await ShippingOrderModel.update(
                        update_values,
                        {
                            where: { id: id },
                            individualHooks: true
                        }
                    );
                if (!(response[0] > 0)) {
                    res.status(200).json({
                        validation:
                            `No changes were made to the`
                            + ` shipping order`
                    });
                    return;
                }
            }
            res.status(200).json({
                message:
                    "shipping order updated succefally"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    }
    static delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        try {
            const validatedShippingOrder: ShippingOrderModel | null
                = await ShippingOrderModel.findByPk(id);

            if (!validatedShippingOrder) {
                res.status(404).json({
                    validation: "Shipping order does not exist"
                });
                return;
            }

            const shippingOrder: ShippingOrderAttributes =
                validatedShippingOrder.toJSON();
            const evidence: LoadEvidenceItem[] =
                shippingOrder.load_evidence;
            await deleteLoadEvidences(evidence);

            const response: number =
                await ShippingOrderModel.destroy({
                    where: { id: id }, individualHooks: true
                });
            if (response < 1) {
                res.status(200).json({
                    validation:
                        "Shipping order not found for deleted"
                });
                return;
            }
            res.status(200).json({
                message:
                    "Shipping order deleted succefally"
            })
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static createComplete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const {
            status, carrier_id,
            load_evidence, delivery_cost,
            shipping_order_purchase_order_product,
            delivery_date,
            shipping_date
        } = req.body;


        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .READ_COMMITTED
            });

        try {

            const validateCarrier =
                await CarrierModel.findByPk(
                    Number(carrier_id),
                    { transaction }
                );

            if (!validateCarrier) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(404).json({
                    validation:
                        "The assigned carrier does not exist"
                });
                return;
            }

            const codeObject: { code: string }[] =
                await sequelize.query(
                    `SELECT func_generate_next_shipping_order_code()`
                    + ` AS code;`,
                    {
                        type: QueryTypes.SELECT
                    }
                );

            const new_code: string =
                codeObject.shift()?.code as string;

            const response = await ShippingOrderModel.create({
                code: new_code,
                status: status || "released",
                carrier_id: Number(carrier_id),
                load_evidence:
                    load_evidence || null,
                delivery_cost: Number(delivery_cost),
                delivery_date,
                shipping_date
            }, { transaction });

            if (!response) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(404).json({
                    validation:
                        "The shipping order could not be created"
                });
                return;
            }
            const shipping = response.toJSON();


            const purchase_order_products:
                ShippingOrderPurchaseOrderProductCreateAttributes[] =
                JSON.parse(
                    shipping_order_purchase_order_product?.toString()
                ) as ShippingOrderPurchaseOrderProductCreateAttributes[];

            const pop: ShippingOrderPurchaseOrderProductCreateAttributes[] =
                purchase_order_products.map(p => ({
                    ...p,
                    shipping_order_id: shipping.id
                }));

            const popsiD: number[] =
                pop.map(p => p.purchase_order_product_id);
            const popQty: number[] = pop.map(p => p.qty);

            const validatePurchasedOrderProducts =
                await PurchaseOrderProductModel.findAll(
                    {
                        where: { id: popsiD },
                        transaction
                    }
                );

            if (validatePurchasedOrderProducts.length
                !== popsiD.length) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(404).json({
                    validation:
                        `Some of the assigned purchase order `
                        + `products do not exist`
                });
                return;
            }

            if (popQty.some(q => q <= 0)) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(400).json({
                    validation:
                        `The assigned purchase order product`
                        + ` quantity for the shipping order `
                        + `must be greater than zero`
                });
                return;
            }

            const popsDetailsResponse: PurchaseOrderProductModel[] =
                await PurchaseOrderProductModel.findAll({
                    where: {
                        id: {
                            [Op.in]: popsiD
                        }
                    },
                    attributes:
                        PurchaseOrderProductModel
                            .getAllFields(),
                    include: [
                        {
                            model: PurchasedOrderModel,
                            as: "purchase_order",
                            attributes:
                                PurchasedOrderModel
                                    .getAllFields()
                        },
                        {
                            model:
                                PurchasedOrdersProductsLocationsProductionLinesModel,
                            as: "purchase_order_product_location_production_line",
                            attributes:
                                PurchasedOrdersProductsLocationsProductionLinesModel
                                    .getAllFields(),
                            include: [{
                                model: ProductionLineModel,
                                as: "production_line",
                                attributes:
                                    ProductionLineModel
                                        .getAllFields(),
                                include: [{
                                    model: LocationsProductionLinesModel,
                                    as: "location_production_line",
                                    attributes:
                                        LocationsProductionLinesModel
                                            .getAllFields()
                                }]
                            }]
                        },
                        {
                            model: ShippingOrderPurchaseOrderProductModel,
                            as: "shipping_order_purchase_order_product",
                            attributes:
                                ShippingOrderPurchaseOrderProductModel
                                    .getAllFields()
                        }
                    ],
                    transaction
                });

            const popsDetails =
                popsDetailsResponse.map(p => p.toJSON());

            const popOfPopsDetails = [...popsDetails].shift();

            const allSameClient: boolean =
                popsDetails.every(p =>
                    p.purchase_order?.client_id ===
                    popOfPopsDetails?.purchase_order?.client_id
                );

            const allSameAddress: boolean =
                popsDetails.every(p =>
                    p.purchase_order?.client_address_id ===
                    popOfPopsDetails?.purchase_order?.client_address_id
                );

            const allSameLocation: boolean =
                popsDetails.every(p =>
                    p.purchase_order_product_location_production_line
                        ?.production_line?.location_production_line?.location_id ===
                    popOfPopsDetails
                        ?.purchase_order_product_location_production_line
                        ?.production_line?.location_production_line?.location_id
                );


            if (!allSameClient) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(400).json({
                    validation:
                        `The purchase order product does not belong`
                        + `to the same client as the shipping order`
                });
                return;
            }

            if (!allSameAddress) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(400).json({
                    validation:
                        `The purchase order product does not belong`
                        + `to the same client address as the shipping order`
                });
                return;
            }

            if (!allSameLocation) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(400).json({
                    validation:
                        `The purchase order product does not belong`
                        + `to the same location as the shipping order`
                });
                return;
            }

            for (const p of popsDetails) {
                const qty_real_pop = p.qty;
                const qty_shipped_pop =
                    p.shipping_order_purchase_order_product
                        ?.reduce((acc, value) => acc + value.qty, 0) || 0;

                const qty_request: number =
                    pop.find(po => po.purchase_order_product_id === p.id)?.qty || 0;

                if (qty_request + qty_shipped_pop > qty_real_pop) {
                    await transaction?.rollback();
                    res.status(400).json({
                        validation:
                            `The qty "${qty_request}" for the product `
                            + `"${p.product_name}" exceeds the quantity ` +
                            `originaly of the purchase order` +
                            `(${p.purchase_order?.order_code}) "${qty_real_pop}".
                            The qty available for the purchase order is `
                            + `"${qty_real_pop - qty_shipped_pop}"`,
                    });
                    return;
                }
            }

            const response2 =
                await ShippingOrderPurchaseOrderProductModel
                    .bulkCreate(
                        pop,
                        { transaction }
                    );

            if (!response2) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(500).json({
                    validation:
                        `The assignment of the purchase order products `
                        + `to the shipping order could not be completed.`
                });
                return;
            }


            const load_evidence_shippingOrder: LoadEvidenceItem[] | undefined =
                shipping?.load_evidence;

            // obtener la ruta relativa de cada imagen
            const pathImages: string[] | undefined =
                load_evidence_shippingOrder?.map(
                    (product) => product.path
                );

            // obtener la ruta obsoluta del directorio padre
            const baseUploadFolder: string =
                path.resolve(process.cwd(), 'uploads');


            // obtener la ruta obsoluta de cada imagen
            const absolutePathFiles: string[] | undefined = pathImages?.map(
                (pathImage) => {
                    // normalizar la ruta relativa de cada imagen
                    const normalizedPath: string =
                        path.normalize(pathImage);
                    // obtener la ruta obsoluta de cada imagen apartir de la
                    // ruta obsoluta del directorio padre
                    const relativeAbsolutePath: string =
                        path.resolve(
                            baseUploadFolder,
                            normalizedPath
                        );
                    return relativeAbsolutePath;
                });


            // crear la ruta del directorio por id del registro
            //  de la bd
            const directoryPath: string =
                path.resolve(
                    baseUploadFolder,
                    'shipping-orders',
                    shipping.id.toString()
                );

            try {
                await access(directoryPath, constants.F_OK);
            } catch {
                await mkdir(directoryPath, { recursive: true });
            }

            const newPathFiles: {
                sourcePath: string;
                destinationPath: string;
            }[] | undefined = absolutePathFiles?.map(
                (sourcePath) => {
                    const fileName =
                        path.basename(sourcePath);
                    const destinationPath =
                        path.resolve(directoryPath, fileName);
                    return {
                        sourcePath,
                        destinationPath
                    };
                }
            );

            await Promise.all(
                newPathFiles?.map(async ({ sourcePath, destinationPath }) => {
                    return await fs.rename(sourcePath, destinationPath);
                }) ?? []
            );

            const relativePathFiles: string[] | undefined =
                newPathFiles?.map(
                    ({ destinationPath }) => {
                        const relativePath: string =
                            path.relative(
                                baseUploadFolder,
                                destinationPath
                            );
                        return relativePath;
                    }
                );

            const newLoadEvidence: LoadEvidenceItem[] | undefined =
                relativePathFiles?.map(
                    (value) => ({
                        path: value,
                        id: value
                    })
                );

            const updatedShippingOrder: [number] =
                await ShippingOrderModel.update(
                    { load_evidence: newLoadEvidence },
                    { where: { id: shipping.id }, transaction }
                );

            if (updatedShippingOrder[0] === 0) {
                await transaction.rollback();
                await deleteLoadEvidences(load_evidence);
                res.status(500).json({
                    validation:
                        "The shipping order "
                        + "could not be updated "
                        + "with the new load evidence"
                });
                return;
            }

            await transaction.commit();

            res.status(201).json(shipping);
        } catch (error: unknown) {
            await transaction?.rollback();
            await deleteLoadEvidences(load_evidence);
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error `
                    + `ocurred ${error}`
                );
            }
        }
    }


    static updateComplete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

        const { id } = req.params;
        const completeBody = req.body;

        let urlImageOld: LoadEvidenceItem[] = [];
        let IsAddNewImage: boolean = false;
        let IsDeleteImage: boolean = false;
        let isSuccessFully: boolean = false;

        try {

            const editableFields =
                ShippingOrderModel.getEditableFields();
            const update_values: ShippingOrderCreationAttributes =
                collectorUpdateFields(
                    editableFields,
                    completeBody
                ) as ShippingOrderCreationAttributes;

            const validateShippingOrder =
                await ShippingOrderModel.findByPk(id);

            if (!validateShippingOrder) {
                await transaction.rollback();
                await deleteLoadEvidences(
                    completeBody.load_evidence
                );
                res.status(404).json({
                    validation:
                        "Shipping order does not exist"
                });
                return;
            }

            const shippingOrder =
                validateShippingOrder.toJSON();

            if (Object.keys(update_values)?.length > 0) {
                if (update_values?.carrier_id) {
                    const validateCarrier =
                        await CarrierModel.findByPk(
                            update_values.carrier_id,
                            { transaction }
                        );

                    if (!validateCarrier) {
                        await transaction?.rollback();
                        await deleteLoadEvidences(
                            completeBody.load_evidence
                        );
                        res.status(404).json({
                            validation:
                                "The assigned carrier does not exist"
                        });
                        return;
                    }
                }
            }

            if (completeBody.load_evidence_deleted &&
                JSON.parse(completeBody.load_evidence_deleted).length > 0) {
                IsDeleteImage = true;
            }

            const load_evidence_old: LoadEvidenceItem[] = (() => {
                try {
                    const raw = completeBody?.load_evidence_old;
                    return typeof raw === 'string' ? JSON.parse(raw) : [];
                } catch {
                    return [];
                }
            })();
            const load_evidence_new: LoadEvidenceItem[] =
                update_values?.load_evidence ?? [];

            if (load_evidence_new.length > 0) {
                load_evidence_new.map((e) => e.path = e.id)
            }

            if (load_evidence_old.length > 0) {
                load_evidence_old.map((e) => e.path = e.id)
            }

            const responseUpdate =
                await ShippingOrderModel.update(
                    {
                        ...update_values,
                        load_evidence: [
                            ...load_evidence_old,
                            ...load_evidence_new,
                        ]

                    },
                    {
                        where: { id: id },
                        transaction
                    }
                );

            if (!responseUpdate) {
                await transaction.rollback();
                await deleteLoadEvidences(
                    completeBody.load_evidence
                );
                res.status(500).json({
                    validation:
                        "The shipping order could not be updated"
                });
                return;
            }

            if (completeBody?.shipping_order_purchase_order_product_manager) {

                const sopopManager: ShippingOrderPurchaseOrderProductManager =
                    JSON.parse(
                        completeBody
                            .shipping_order_purchase_order_product_manager
                    );

                const flagProductsInputsUpdate: boolean = [
                    sopopManager.added,
                    sopopManager.deleted,
                    sopopManager.modified
                ].some((p) => p?.length > 0);

                if (flagProductsInputsUpdate) {
                    const adds: ShippingOrderPurchaseOrderProductCreateAttributes[] =
                        sopopManager.added;
                    const deletes: ShippingOrderPurchaseOrderProductAttributes[] =
                        sopopManager.deleted;
                    const modified: ShippingOrderPurchaseOrderProductCreateAttributes[] =
                        sopopManager.modified;

                    if (deletes.length > 0) {

                        const deletedFiltered:
                            ShippingOrderPurchaseOrderProductAttributes[] =
                            deletes.filter(d => d.id !== undefined);

                        const existingSopopsResponse =
                            await ShippingOrderPurchaseOrderProductModel.findAll({
                                where: {
                                    id: { [Op.in]: deletedFiltered.map(d => d.id) }
                                }, transaction,
                                lock: transaction.LOCK.SHARE,
                            });


                        if (existingSopopsResponse.length
                            !== deletedFiltered.length) {

                            await transaction.rollback();
                            await deleteLoadEvidences(
                                completeBody.load_evidence
                            );
                            res.status(404).json({
                                validation:
                                    `Some products of the shipping order you`
                                    + ` are trying to delete do not exist`,
                            });
                            return;
                        }

                        const responseDelete =
                            await ShippingOrderPurchaseOrderProductModel
                                .destroy({
                                    where: {
                                        id:
                                        {
                                            [Op.in]:
                                                deletedFiltered.map(d => d.id)
                                        }
                                    },
                                    transaction
                                });

                        if (!responseDelete) {
                            await transaction.rollback();
                            await deleteLoadEvidences(
                                completeBody.load_evidence
                            );
                            res.status(400).json({
                                validation:
                                    `The purchased order products of the `
                                    + `shipping order could not be deleted`
                            });
                            return;
                        }
                    }
                    if (modified.length > 0) {

                        const modifiedFiltered:
                            ShippingOrderPurchaseOrderProductCreateAttributes[] =
                            modified.filter(d => d.id !== undefined);

                        const popsiD: number[] =
                            modifiedFiltered.map(d => d.id as number);

                        const existingSopopsResponse =
                            await ShippingOrderPurchaseOrderProductModel.findAll({
                                where: {
                                    id: { [Op.in]: popsiD }
                                }, transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (existingSopopsResponse.length
                            !== modifiedFiltered.length) {
                            await transaction.rollback();
                            await deleteLoadEvidences(
                                completeBody.load_evidence
                            );
                            res.status(404).json({
                                validation:
                                    `Some products of the shipping order you`
                                    + ` are trying to modify do not exist`,
                            });
                            return;
                        }

                        const popsDetailsResponse: PurchaseOrderProductModel[] =
                            await PurchaseOrderProductModel.findAll({
                                where: {
                                    id: {
                                        [Op.in]: popsiD
                                    }
                                },
                                attributes:
                                    PurchaseOrderProductModel
                                        .getAllFields(),
                                include: [
                                    {
                                        model: PurchasedOrderModel,
                                        as: "purchase_order",
                                        attributes:
                                            PurchasedOrderModel
                                                .getAllFields()
                                    },
                                    {
                                        model:
                                            PurchasedOrdersProductsLocationsProductionLinesModel,
                                        as: "purchase_order_product_location_production_line",
                                        attributes:
                                            PurchasedOrdersProductsLocationsProductionLinesModel
                                                .getAllFields(),
                                        include: [{
                                            model: ProductionLineModel,
                                            as: "production_line",
                                            attributes:
                                                ProductionLineModel
                                                    .getAllFields(),
                                            include: [{
                                                model: LocationsProductionLinesModel,
                                                as: "location_production_line",
                                                attributes:
                                                    LocationsProductionLinesModel
                                                        .getAllFields()
                                            }]
                                        }]
                                    },
                                    {
                                        model: ShippingOrderPurchaseOrderProductModel,
                                        as: "shipping_order_purchase_order_product",
                                        attributes:
                                            ShippingOrderPurchaseOrderProductModel
                                                .getAllFields()
                                    }
                                ],
                                transaction
                            });

                        const new_pops =
                            [...popsDetailsResponse].map(m => m.toJSON());

                        for (const p of new_pops) {
                            const qty_real_pop = p.qty;
                            const qty_shipped_pop =
                                p.shipping_order_purchase_order_product
                                    ?.reduce((acc, value) => acc + value.qty, 0) || 0;

                            const qty_pop_old =
                                p.shipping_order_purchase_order_product
                                    ?.find(po => po.purchase_order_product_id === p.id)
                                    ?.qty || 0;

                            const update_values =
                                modifiedFiltered
                                    .find(po =>
                                        +po.purchase_order_product_id
                                        === p.id
                                    );

                            const qty_request: number =
                                update_values?.qty || 0;

                            if ((qty_request + (qty_shipped_pop - qty_pop_old)) > qty_real_pop) {
                                await transaction?.rollback();
                                await deleteLoadEvidences(
                                    completeBody.load_evidence
                                );
                                res.status(400).json({
                                    validation:
                                        `The qty "${qty_request}" for the product `
                                        + `"${p.product_name}" exceeds the quantity ` +
                                        `originaly of the purchase order` +
                                        `(${p.purchase_order?.order_code}) "${qty_real_pop}".
                                        The qty available for the purchase order is `
                                        + `"${qty_real_pop - (qty_shipped_pop - qty_pop_old)}"`,
                                });
                                return;
                            }

                            const sopops =
                                existingSopopsResponse.map(m => m.toJSON());

                            const sopop = sopops.find(
                                po =>
                                    po.purchase_order_product_id === p.id
                            );

                            const sopop_update = modifiedFiltered.find(
                                po =>
                                    po.id === sopop?.id
                            );

                            const update: [affectedCount: number] =
                                await ShippingOrderPurchaseOrderProductModel
                                    .update(
                                        { qty: sopop_update?.qty }, {
                                        where: {
                                            [Op.and]: [{
                                                purchase_order_product_id:
                                                    sopop?.purchase_order_product_id
                                            }, {
                                                shipping_order_id:
                                                    sopop?.shipping_order_id
                                            }]
                                        },
                                        transaction
                                    }
                                    );

                            if (!(update[0] > 0)) {
                                await transaction?.rollback();
                                await deleteLoadEvidences(
                                    completeBody.load_evidence
                                );
                                res.status(400).json({
                                    validation:
                                        `The purchase order product of `
                                        + `the shipping order`
                                        + `could not be updated`
                                });
                                return;
                            }
                        }

                    }

                    if (adds.length > 0) {

                        const addsFiltered:
                            ShippingOrderPurchaseOrderProductCreateAttributes[] =
                            adds;
                        const popsiD: number[] =
                            addsFiltered.map(d => d.purchase_order_product_id);

                        const existingSopopsResponse =
                            await PurchaseOrderProductModel.findAll({
                                where: {
                                    id: { [Op.in]: popsiD }
                                }, transaction,
                                lock: transaction.LOCK.SHARE,
                            });

                        if (existingSopopsResponse.length
                            !== addsFiltered.length) {
                            await transaction.rollback();
                            await deleteLoadEvidences(
                                completeBody.load_evidence
                            );
                            res.status(404).json({
                                validation:
                                    `Some purchase order products of the `
                                    + `shipping order you`
                                    + ` are trying to add do not exist`,
                            });
                            return;
                        }

                        const validateShippingOrderClientOnShippingOrder =
                            await ShippingOrderPurchaseOrderProductModel.findAll({
                                where: { shipping_order_id: id },
                                attributes:
                                    ShippingOrderPurchaseOrderProductModel
                                        .getAllFields(),
                                include: [{
                                    model: PurchaseOrderProductModel,
                                    as: "purchase_order_products",
                                    include: [
                                        {
                                            model: PurchasedOrderModel,
                                            as: "purchase_order",
                                            attributes:
                                                PurchasedOrderModel
                                                    .getAllFields()
                                        },
                                        {
                                            model:
                                                PurchasedOrdersProductsLocationsProductionLinesModel,
                                            as: "purchase_order_product_location_production_line",
                                            attributes:
                                                PurchasedOrdersProductsLocationsProductionLinesModel
                                                    .getAllFields(),
                                            include: [{
                                                model: ProductionLineModel,
                                                attributes: ProductionLineModel.getAllFields(),
                                                as: "production_line",
                                                include: [{
                                                    model: LocationsProductionLinesModel,
                                                    as: "location_production_line",
                                                    attributes:
                                                        LocationsProductionLinesModel
                                                            .getAllFields()
                                                }]
                                            }]
                                        }
                                    ]
                                }],
                                transaction
                            });

                        const popsDetailsResponse: PurchaseOrderProductModel[] =
                            await PurchaseOrderProductModel.findAll({
                                where: {
                                    id: {
                                        [Op.in]: popsiD
                                    }
                                },
                                attributes:
                                    PurchaseOrderProductModel
                                        .getAllFields(),
                                include: [
                                    {
                                        model: PurchasedOrderModel,
                                        as: "purchase_order",
                                        attributes:
                                            PurchasedOrderModel
                                                .getAllFields()
                                    },
                                    {
                                        model:
                                            PurchasedOrdersProductsLocationsProductionLinesModel,
                                        as: "purchase_order_product_location_production_line",
                                        attributes:
                                            PurchasedOrdersProductsLocationsProductionLinesModel
                                                .getAllFields(),
                                        include: [{
                                            model: ProductionLineModel,
                                            as: "production_line",
                                            attributes:
                                                ProductionLineModel
                                                    .getAllFields(),
                                            include: [{
                                                model: LocationsProductionLinesModel,
                                                as: "location_production_line",
                                                attributes:
                                                    LocationsProductionLinesModel
                                                        .getAllFields()
                                            }]
                                        }]
                                    },
                                    {
                                        model: ShippingOrderPurchaseOrderProductModel,
                                        as: "shipping_order_purchase_order_product",
                                        attributes:
                                            ShippingOrderPurchaseOrderProductModel
                                                .getAllFields()
                                    }
                                ],
                                transaction
                            });

                        const sopopsInShippingOrder =
                            validateShippingOrderClientOnShippingOrder
                                .map(m => m.toJSON());

                        const pop_test_from_sopops =
                            [...sopopsInShippingOrder].shift();

                        const new_pops =
                            [...popsDetailsResponse].map(m => m.toJSON());


                        const allSameClient: boolean =
                            new_pops.every(p =>
                                p.purchase_order?.client_id ===
                                pop_test_from_sopops
                                    ?.purchase_order_products
                                    ?.purchase_order
                                    ?.client_id
                            );

                        const allSameAddress: boolean =
                            new_pops.every(p =>
                                p.purchase_order?.client_address_id ===
                                pop_test_from_sopops
                                    ?.purchase_order_products
                                    ?.purchase_order
                                    ?.client_address_id
                            );

                        const allSameLocation: boolean =
                            new_pops.every(p =>
                                p.purchase_order_product_location_production_line
                                    ?.production_line
                                    ?.location_production_line
                                    ?.location_id ===
                                pop_test_from_sopops
                                    ?.purchase_order_products
                                    ?.purchase_order_product_location_production_line
                                    ?.production_line
                                    ?.location_production_line
                                    ?.location_id
                            );

                        if (!allSameClient) {
                            await transaction.rollback();
                            await deleteLoadEvidences(
                                completeBody.load_evidence
                            );
                            res.status(400).json({
                                validation:
                                    "The purchase order product does not belong"
                                    + "to the same client as the shipping order"
                            });
                            return;
                        }

                        if (!allSameAddress) {
                            await transaction.rollback();
                            await deleteLoadEvidences(
                                completeBody.load_evidence
                            );
                            res.status(400).json({
                                validation:
                                    "The purchase order product does not belong"
                                    + "to the same client address as the shipping order"
                            });
                            return;
                        }

                        if (!allSameLocation) {
                            await transaction.rollback();
                            await deleteLoadEvidences(
                                completeBody.load_evidence
                            );
                            res.status(400).json({
                                validation:
                                    "The purchase order product does not belong"
                                    + "to the same location as the shipping order"
                            });
                            return;
                        }

                        for (const p of new_pops) {
                            const qty_real_pop = p.qty;
                            const qty_shipped_pop =
                                p.shipping_order_purchase_order_product
                                    ?.reduce((acc, value) => acc + value.qty, 0) || 0;

                            const qty_pop_old =
                                p.shipping_order_purchase_order_product
                                    ?.find(po => po.purchase_order_product_id === p.id)
                                    ?.qty || 0;

                            const update_values =
                                addsFiltered
                                    .find(po =>
                                        +po.purchase_order_product_id
                                        === p.id
                                    );

                            const qty_request: number =
                                update_values?.qty || 0;

                            if ((qty_request + (qty_shipped_pop - qty_pop_old)) > qty_real_pop) {
                                await transaction?.rollback();
                                await deleteLoadEvidences(
                                    completeBody.load_evidence
                                );
                                res.status(400).json({
                                    validation:
                                        `The qty "${qty_request}" for the product `
                                        + `"${p.product_name}" exceeds the quantity` +
                                        `originaly of the purchase order` +
                                        `(${p.purchase_order?.order_code}) "${qty_real_pop}".
                                    The qty available for the purchase order is `
                                        + `"${qty_real_pop - (qty_shipped_pop - qty_pop_old)}"`,
                                });
                                return;
                            }

                            const new_sopops =
                                addsFiltered.map((item) => {
                                    return {
                                        ...item,
                                        shipping_order_id: shippingOrder.id
                                    }
                                })

                            const responseCreate =
                                await ShippingOrderPurchaseOrderProductModel
                                    .bulkCreate(
                                        new_sopops,
                                        { transaction }
                                    );

                            if (responseCreate.length !== addsFiltered.length) {
                                await transaction?.rollback();
                                await deleteLoadEvidences(
                                    completeBody.load_evidence
                                );
                                res.status(400).json({
                                    validation:
                                        `The purchase order product of`
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
                message:
                    "Shipping order updated successfully"
            })

        } catch (error: unknown) {
            await transaction.rollback();
            await deleteLoadEvidences(
                completeBody.load_evidence
            );
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error `
                    + `ocurred ${error} `);
            }
        } finally {
            if (IsDeleteImage && isSuccessFully) {
                const load_evidence_deleted: PartialLoadEvidenceItem[] =
                    JSON.parse(completeBody.load_evidence_deleted);
                const evidence_delete = load_evidence_deleted.map((item) => {
                    return {
                        path: item.id,
                        id: item.id
                    }
                }) as LoadEvidenceItem[];

                await deleteLoadEvidences(
                    evidence_delete
                );
            }
        }
    }
}

export default ShippingOrderController;