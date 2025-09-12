import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import sequelize
    from "../../../../mysql/configSequelize.js";
import {
    LocationModel,
    LocationTypeModel,
    LocationLocationTypeModel,
    ProductionLineModel,
    LocationsProductionLinesModel,
    ProductionLineProductModel,
    ProductModel,
    PurchasedOrdersProductsLocationsProductionLinesModel,
    InternalProductionOrderLineProductModel,
    PurchaseOrderProductModel,
    InternalProductProductionOrderModel,
    ProductProcessModel,
    ProcessModel
} from "../../../associations.js";
import {
    LocationAttributes,
    LocationCreateAttributes,
    LocationLocationTypeAttributes,
    LocationTypeAttributes
} from "../types.js";
import {
    Response,
    Request,
    NextFunction
} from "express";
import {
    Op,
    QueryTypes,
    Transaction
} from "sequelize";

class LocationController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await LocationModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Locations no found" });
                return;
            }
            const locations = response.map(l => l.toJSON());
            res.status(200).json(locations);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    // static getLocationWithAllInformation = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     try {
    //         const response = await LocationModel.findOne({
    //             where: { id },
    //             attributes: LocationModel.getAllFields(),
    //             subQuery: false, // evita subconsultas que cambian alias
    //             include: [
    //                 {
    //                     model: LocationsProductionLinesModel,
    //                     as: "location_production_line",
    //                     required: false,
    //                     attributes: LocationsProductionLinesModel.getAllFields(),
    //                     include: [
    //                         {
    //                             model: ProductionLineModel,
    //                             as: "production_line",
    //                             required: false,
    //                             attributes: ProductionLineModel.getAllFields(),
    //                             include: [
    //                                 {
    //                                     model: ProductionLineProductModel,
    //                                     as: "production_lines_products",
    //                                     required: false,
    //                                     attributes: ProductionLineProductModel.getAllFields(),
    //                                     include: [
    //                                         {
    //                                             model: ProductModel,
    //                                             as: "products",
    //                                             required: false,
    //                                             attributes: ProductModel.getAllFields(),
    //                                             include: [
    //                                                 {
    //                                                     model: ProductProcessModel,
    //                                                     as: "product_processes",
    //                                                     required: false,
    //                                                     separate: true,                        // 👈 necesario para que 'order' funcione aquí
    //                                                     order: [["sort_order", "ASC"]],        // 👈 ahora sí funciona
    //                                                     attributes: ProductProcessModel.getAllFields(),
    //                                                     include: [
    //                                                         {
    //                                                             model: ProcessModel,
    //                                                             as: "process",
    //                                                             required: false,
    //                                                             attributes: ProcessModel.getAllFields()
    //                                                         }
    //                                                     ]
    //                                                 }
    //                                             ]
    //                                         }
    //                                     ],
    //                                 },
    //                                 {
    //                                     model: PurchasedOrdersProductsLocationsProductionLinesModel,
    //                                     as: "purchase_order_product_location_production_line",
    //                                     required: false,
    //                                     attributes: PurchasedOrdersProductsLocationsProductionLinesModel.getAllFields(),
    //                                     include: [
    //                                         {
    //                                             model: PurchaseOrderProductModel,
    //                                             as: "purchase_order_product",
    //                                             required: false,
    //                                             attributes: [
    //                                                 ...PurchaseOrderProductModel.getAllFields(),
    //                                                 // Usar ruta completa de alias con '->'
    //                                                 [
    //                                                     sequelize.fn(
    //                                                         "func_get_productions_of_order",
    //                                                         sequelize.col(
    //                                                             "location_production_line->production_line->purchase_order_product_location_production_line->purchase_order_product.id"
    //                                                         ),
    //                                                         sequelize.literal("'client'")
    //                                                     ),
    //                                                     "production_order"
    //                                                 ]
    //                                             ],
    //                                             include: [
    //                                                 {
    //                                                     model: ProductModel,
    //                                                     as: "product",
    //                                                     required: false,
    //                                                     attributes: ProductModel.getAllFields(),
    //                                                 }
    //                                             ]
    //                                         }
    //                                     ]
    //                                 },
    //                                 {
    //                                     model: InternalProductionOrderLineProductModel,
    //                                     as: "internal_production_order_line_product",
    //                                     required: false,
    //                                     attributes: InternalProductionOrderLineProductModel.getAllFields(),
    //                                     include: [
    //                                         {
    //                                             model: InternalProductProductionOrderModel,
    //                                             as: "internal_product_production_order",
    //                                             required: false,
    //                                             attributes: [
    //                                                 ...InternalProductProductionOrderModel.getAllFields(),
    //                                                 [
    //                                                     sequelize.fn(
    //                                                         "func_get_productions_of_order",
    //                                                         sequelize.col(
    //                                                             "location_production_line->production_line->internal_production_order_line_product->internal_product_production_order.id"
    //                                                         ),
    //                                                         sequelize.literal("'internal'")
    //                                                     ),
    //                                                     "production_order"
    //                                                 ]
    //                                             ],
    //                                             include: [
    //                                                 {
    //                                                     model: ProductModel,
    //                                                     as: "product",
    //                                                     required: false,
    //                                                     attributes: ProductModel.getAllFields(),
    //                                                 }
    //                                             ]
    //                                         }
    //                                     ]
    //                                 }
    //                             ]
    //                         },
    //                     ],
    //                 }
    //             ]
    //         });

    //         if (!response) {
    //             res.status(200).json([]);
    //             return;
    //         }

    //         const locations = response.toJSON();
    //         res.status(200).json(locations);
    //     } catch (error: unknown) {
    //         if (error instanceof Error) {
    //             next(error);
    //         } else {
    //             console.error(`An unexpected error ocurred ${error}`);
    //         }
    //     }
    // };

    static getLocationWithAllInformation = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await LocationModel.findOne({
                where: { id },
                attributes: LocationModel.getAllFields(),
                subQuery: false,
                include: [
                    {
                        model: LocationsProductionLinesModel,
                        as: "location_production_line",
                        required: false,
                        attributes: LocationsProductionLinesModel.getAllFields(),
                        include: [
                            {
                                model: ProductionLineModel,
                                as: "production_line",
                                required: false,
                                attributes: ProductionLineModel.getAllFields(),
                                include: [
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
                                                include: [
                                                    {
                                                        model: ProductProcessModel,
                                                        as: "product_processes",
                                                        required: false,
                                                        separate: true,
                                                        order: [["sort_order", "ASC"]],
                                                        attributes: ProductProcessModel.getAllFields(),
                                                        include: [
                                                            {
                                                                model: ProcessModel,
                                                                as: "process",
                                                                required: false,
                                                                attributes: ProcessModel.getAllFields(),
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        model: PurchasedOrdersProductsLocationsProductionLinesModel,
                                        as: "purchase_order_product_location_production_line",
                                        required: false,
                                        attributes: PurchasedOrdersProductsLocationsProductionLinesModel.getAllFields(),
                                        include: [
                                            {
                                                model: PurchaseOrderProductModel,
                                                as: "purchase_order_product",
                                                required: false,
                                                attributes: [
                                                    ...PurchaseOrderProductModel.getAllFields(),
                                                    [
                                                        sequelize.fn(
                                                            "func_get_productions_of_order",
                                                            sequelize.col(
                                                                "location_production_line->production_line->purchase_order_product_location_production_line->purchase_order_product.id"
                                                            ),
                                                            sequelize.literal("'client'")
                                                        ),
                                                        "production_order",
                                                    ],
                                                ],
                                                include: [
                                                    {
                                                        model: ProductModel,
                                                        as: "product",
                                                        required: false,
                                                        attributes: ProductModel.getAllFields(),
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        model: InternalProductionOrderLineProductModel,
                                        as: "internal_production_order_line_product",
                                        required: false,
                                        attributes: InternalProductionOrderLineProductModel.getAllFields(),
                                        include: [
                                            {
                                                model: InternalProductProductionOrderModel,
                                                as: "internal_product_production_order",
                                                required: false,
                                                attributes: [
                                                    ...InternalProductProductionOrderModel.getAllFields(),
                                                    [
                                                        sequelize.fn(
                                                            "func_get_productions_of_order",
                                                            sequelize.col(
                                                                "location_production_line->production_line->internal_production_order_line_product->internal_product_production_order.id"
                                                            ),
                                                            sequelize.literal("'internal'")
                                                        ),
                                                        "production_order",
                                                    ],
                                                ],
                                                include: [
                                                    {
                                                        model: ProductModel,
                                                        as: "product",
                                                        required: false,
                                                        attributes: ProductModel.getAllFields(),
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            if (!response) {
                res.status(200).json([]);
                return;
            }

            // ===================== Normalización en backend =====================
            const safeParse = (val: unknown) => {
                if (val == null) return null;
                if (typeof val === "string") {
                    try { return JSON.parse(val); } catch { return val; }
                }
                return val;
            };

            const toNumber = (v: any): number => (v == null ? 0 : typeof v === "number" ? v : Number(v));

            const data = response.toJSON() as any;

            (data.location_production_line ?? []).forEach((lp: any) => {
                const pl = lp?.production_line;
                if (!pl) return;

                // CLIENT (purchase_order_product_location_production_line)
                const clients = (pl.purchase_order_product_location_production_line ?? []).map((row: any) => {
                    const pop = row?.purchase_order_product;
                    const po = safeParse(pop?.production_order) as any | null;

                    // Producto preferente: el que viene en purchase_order_product.product
                    // (si no, podrías intentar buscarlo en production_lines_products)
                    const product = pop?.product;

                    return {
                        // id único de UI (prefijo 1 para distinguir de internal)
                        id: Number(`1${row.id}`),
                        production_order_id: po?.id ?? null,
                        order_type: (po?.order_type ?? "client") as "client" | "internal",
                        product_id: pop?.product_id ?? po?.product_id ?? null,
                        product_name: pop?.product_name ?? po?.product_name ?? "",
                        qty: toNumber(pop?.qty ?? po?.qty ?? 0),
                        status: po?.status ?? pop?.status ?? "pending",
                        productions: po?.productions ?? [],
                        product, // incluye sku, processes ya ordenados por separate+order
                    };
                });

                // INTERNAL (internal_production_order_line_product)
                const internals = (pl.internal_production_order_line_product ?? []).map((row: any) => {
                    const ipo = row?.internal_product_production_order;
                    const po = safeParse(ipo?.production_order) as any | null;
                    const product = ipo?.product;

                    return {
                        // id único de UI (prefijo 2 para distinguir de client)
                        id: Number(`2${row.id}`),
                        production_order_id: po?.id ?? null,
                        order_type: (po?.order_type ?? "internal") as "client" | "internal",
                        product_id: ipo?.product_id ?? po?.product_id ?? null,
                        product_name: ipo?.product_name ?? po?.product_name ?? "",
                        qty: toNumber(ipo?.qty ?? po?.qty ?? 0),
                        status: po?.status ?? ipo?.status ?? "pending",
                        productions: po?.productions ?? [],
                        product,
                    };
                });

                // Combina y (opcional) ordena por production_order_id asc
                const combined = [...clients, ...internals].sort(
                    (a, b) => (a.production_order_id ?? 0) - (b.production_order_id ?? 0)
                );

                // Asigna el array normalizado
                pl.production_order = combined;

                // Remueve los arreglos crudos para simplificar el payload
                delete pl.purchase_order_product_location_production_line;
                delete pl.internal_production_order_line_product;
            });
            // ===================== /Normalización =====================

            res.status(200).json(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };



    static getAllWithTypes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const responseLocations = await LocationModel.findAll({
                attributes: LocationModel.getAllFields(),
                include: [
                    {
                        model: LocationLocationTypeModel,
                        as: "location_location_type",
                        attributes: LocationLocationTypeModel.getAllFields(),
                        include: [
                            {
                                model: LocationTypeModel,
                                as: "location_type",
                                attributes: LocationTypeModel.getAllFields(),
                            },
                        ],
                    },
                ],
            });

            if (!(responseLocations.length > 0)) {
                res.status(404).json([]);
                return;
            }

            interface LocationLocationTypeWithTypes extends LocationLocationTypeAttributes {
                location_type: LocationTypeAttributes;
            }

            interface LocationWithTypes extends LocationAttributes {
                location_location_type?: LocationLocationTypeWithTypes[];
            }

            // Aquí convertimos el resultado de Sequelize a objeto plano
            const data = responseLocations.map((l) => l.toJSON()) as LocationWithTypes[];

            // Mapeamos los tipos desde la relación pivote
            const dataWithTypes = data.map((d) => {
                const types = d.location_location_type?.map((rel) => rel.location_type) || [];
                delete d.location_location_type;
                d.types = types;
                return d;
            })

            res.status(200).json(dataWithTypes);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static getTypesOfLocation = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        try {
            const location = await LocationModel.findByPk(id, {
                attributes: LocationModel.getAllFields(),
                include: [
                    {
                        model: LocationLocationTypeModel,
                        as: "location_location_type",
                        attributes: LocationLocationTypeModel.getAllFields(),
                        include: [
                            {
                                model: LocationTypeModel,
                                as: "location_type",
                                attributes: LocationTypeModel.getAllFields(),
                            },
                        ],
                    },
                ],
            });

            if (!location) {
                res.status(404).json([]);
                return;
            }

            interface LocationLocationTypeWithTypes extends LocationLocationTypeAttributes {
                location_type: LocationTypeAttributes;
            }

            interface LocationWithTypes extends LocationAttributes {
                location_location_type?: LocationLocationTypeWithTypes[];
            }

            // Aquí convertimos el resultado de Sequelize a objeto plano
            const data = location.toJSON() as LocationWithTypes;

            // Mapeamos los tipos desde la relación pivote
            const types = data.location_location_type?.map((rel) => rel.location_type) || [];

            // Eliminamos la relación pivote para devolver solo 'types'
            delete data.location_location_type;
            data.types = types;

            res.status(200).json(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error("Unexpected error:", error);
            }
        }
    };


    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await LocationModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "Location no found" });
                return;
            }
            const location = response.toJSON();
            res.status(200).json(location);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getByName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        try {
            const response = await LocationModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Location no found" });
                return;
            }
            const location = response.toJSON();
            res.status(200).json(location);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }


    static getLocationsProducedOneProduct = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { product_id } = req.params;
        try {

            type ProductionLocation = { production_locations: LocationAttributes[] };

            const response: ProductionLocation[] = await sequelize.query(
                "SELECT func_get_product_production_locations(:product_id) AS production_locations",
                {
                    replacements: { product_id: product_id },
                    type: QueryTypes.SELECT,
                }
            );
            const locations: LocationAttributes[] = response[0].production_locations;
            res.status(200).json(locations);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static getProductionLinesForProductAtLocation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { location_id, product_id } = req.params;
        try {
            const response = await ProductionLineModel.findAll({
                attributes: ProductionLineModel.getAllFields(),
                include: [
                    {
                        model: LocationsProductionLinesModel,
                        as: "location_production_line",
                        attributes: [],
                        where: {
                            location_id: location_id
                        }
                    },
                    {
                        model: ProductionLineProductModel,
                        as: "production_lines_products",
                        attributes: [],
                        where: {
                            product_id: product_id
                        }
                    }
                ]
            });
            const production_lines = response.map((pl) => pl.toJSON());
            res.status(200).json(production_lines);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static getInventoryInputsOfProductInOneLocation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { product_id, location_id } = req.params;

        interface InventoryInput {
            input_id: number;
            input_name: string;
            stock: number;
            available: number;
            equivalence: number;
            minimum_stock: number;
            maximum_stock: number;
        }

        try {
            const response: { inventory_inputs: InventoryInput[] }[] = await sequelize.query(
                "SELECT func_get_inventory_locations_for_Inputs_of_product(:product_id, :location_id) AS inventory_inputs",
                {
                    replacements: { product_id: product_id, location_id: location_id },
                    type: QueryTypes.SELECT,
                }
            );
            const inventory_inputs: InventoryInput[] = response[0].inventory_inputs;
            res.status(200).json(inventory_inputs);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;
        try {
            const validateName = await LocationModel.findOne({ where: { name: name } });
            if (validateName) {
                res.status(200).json({
                    validation: "The name is already currently in use by a location"
                });
                return;
            }
            const response = await LocationModel.create({
                name,
                description,
            });
            if (!response) {
                res.status(200).json({ message: "The location could not be created" });
                return;
            }
            res.status(201).json({ message: "Location created successfully" })
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const editableFields = LocationModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "There are no validated location properties for the update."
                });
                return;
            }
            const validatedLocation = await LocationModel.findOne({ where: { id: id } });
            if (!validatedLocation) {
                res.status(404).json({
                    validation: "Location not found"
                });
                return;
            }
            if (update_values?.name) {
                const validateName = await LocationModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.name },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    res.status(409).json({
                        validation:
                            "The name is already currently in use by a location"
                    });
                    return;
                }
            }
            const response = await LocationModel.update(
                update_values,
                {
                    where: { id: id },
                    individualHooks: true
                }
            );
            if (!(response[0] > 0)) {
                res.status(400).json({
                    validation:
                        "No changes were made to the location"
                });
                return;
            }
            res.status(200).json({
                message: "Location updated succefally"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {

            const validationinventory = await sequelize.query(
                `SELECT func_is_location_has_inventory(:id) AS has_inventory;`, {
                replacements: { id: id },
                type: QueryTypes.SELECT
            })

            interface ValidationInventory {
                has_inventory: boolean;
            }
            const { has_inventory }: ValidationInventory =
                validationinventory[0] as ValidationInventory;

            if (has_inventory) {
                res.status(400).json({
                    validation:
                        "The location cannot be deleted because "
                        + "it has inventory assigned"
                });
                return;
            }
            const response = await LocationModel.destroy({
                where: { id: id },
                individualHooks: true
            });

            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "Location not found for deleted"
                });
                return;
            }
            res.status(200).json({
                message:
                    "Location deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`
                );
            }
        }
    }

    static createComplete = async (req: Request, res: Response, next: NextFunction) => {

        const transaction = await sequelize.transaction({
            isolationLevel:
                Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });

        const { name, description, types } = req.body as {
            name: string;
            description: string;
            types: LocationTypeAttributes[];
        };

        try {
            // Validar nombre único de ubicación
            const validateName = await LocationModel.findOne({
                where: { name },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (validateName) {
                await transaction.rollback();
                res.status(404).json({
                    validation:
                        "The name is already currently in use by a location"
                });
                return;
            }

            // Crear ubicación
            const response = await LocationModel.create({
                name,
                description
            }, { transaction });

            if (!response) {
                await transaction.rollback();
                res.status(400).json({
                    message:
                        "The location could not be created"
                });
                return;
            }

            const location = response.toJSON();

            if (!types || types.length === 0) {
                await transaction.rollback();
                res.status(400).json({
                    message:
                        "Location types are required for location creation"
                });
                return;
            }

            // Validar que todos los location_types existen (una sola consulta)
            const typeIds = types.map(t => t.id);
            const existingTypes = await LocationTypeModel.findAll({
                where: { id: typeIds },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (existingTypes.length !== types.length) {
                await transaction.rollback();
                res.status(404).json({
                    validation:
                        "Some of the assigned location types do not exist"
                });
                return;
            }

            // Verificar si alguno ya está asignado a esa ubicación
            const existingAssignments = await LocationLocationTypeModel.findAll({
                where: {
                    location_id: location.id,
                    location_type_id: typeIds,
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (existingAssignments.length > 0) {
                await transaction.rollback();
                res.status(409).json({
                    validation:
                        "Some types have already been assigned to the location"
                });
                return;
            }

            // Crear las asignaciones en bulk
            const typesToCreate = types.map(type => ({
                location_type_id: type.id,
                location_id: location.id
            }));

            const created =
                await LocationLocationTypeModel.bulkCreate(
                    typesToCreate,
                    { transaction }
                );

            if (!created || created.length === 0) {
                await transaction.rollback();
                res.status(500).json({
                    validation:
                        "The types could not be assigned to the location"
                });
                return;
            }

            await transaction.commit();

            res.status(201).json({
                message:
                    "Location created successfully"
            });
        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`
                );
                res.status(500).json({
                    message: "Unexpected error occurred"
                });
            }
        }
    };


    static updateComplete = async (req: Request, res: Response, next: NextFunction) => {

        const transaction = await sequelize.transaction({
            isolationLevel:
                Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });

        interface LocationTypeManager {
            added: LocationTypeAttributes[];
            deleted: LocationTypeAttributes[];
            modified: LocationTypeAttributes[];
        }

        const { update_fields, update_types } = req.body as {
            update_fields: LocationCreateAttributes,
            update_types: LocationTypeManager;
        };

        const { id } = req.params;

        try {

            const validatedLocation =
                await LocationModel.findOne({ where: { id: id } });
            if (!validatedLocation) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "Location not found"
                });
                return;
            }
            const editableFields =
                LocationModel.getEditableFields();
            const update_values =
                collectorUpdateFields(editableFields, update_fields);

            if (Object.keys(update_values).length > 0) {
                if (update_values?.name) {
                    const validateName = await LocationModel.findOne({
                        where: {
                            [Op.and]: [
                                { name: update_values.name },
                                { id: { [Op.ne]: id } }
                            ]
                        }
                    });
                    if (validateName) {
                        await transaction.rollback();
                        res.status(409).json({
                            validation:
                                `The name is already currently `
                                + `in use by a location`
                        });
                        return;
                    }
                }

                const responseLocation = await LocationModel.update(
                    update_values,
                    {
                        where: { id: id },
                        individualHooks: true,
                        transaction: transaction
                    },
                );
                if (!responseLocation) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "The location could not be updated"
                    });
                    return;
                }
            }
            const flagTypesUpdate = (update_types.added.length > 0
                || update_types.deleted.length > 0
                || update_types.modified.length > 0
            );
            if (flagTypesUpdate) {
                if (update_types.added.length > 0) {
                    const typeIds = update_types.added.map(t => t.id);

                    const validTypes = await LocationTypeModel.findAll({
                        where: { id: typeIds },
                        transaction,
                        lock: transaction.LOCK.UPDATE,
                    });

                    if (validTypes.length !== typeIds.length) {
                        await transaction.rollback();
                        res.status(404).json({
                            validation:
                                `Some of the assigned location types do`
                                + ` not exist`,
                        });
                        return;
                    }

                    const alreadyAssigned =
                        await LocationLocationTypeModel.findAll({
                            where: {
                                location_id: id,
                                location_type_id: typeIds,
                            },
                            transaction,
                            lock: transaction.LOCK.UPDATE,
                        }
                        );

                    if (alreadyAssigned.length > 0) {
                        await transaction.rollback();
                        res.status(409).json({
                            validation:
                                `Some types have already been assigned `
                                + `to the location`,
                        });
                        return;
                    }

                    const assignments = typeIds.map((typeId) => ({
                        location_id: Number(id),
                        location_type_id: typeId,
                    }));

                    await LocationLocationTypeModel.bulkCreate(
                        assignments,
                        { transaction }
                    );
                }

                if (update_types.deleted.length > 0) {
                    const storedTypesPresent =
                        update_types.deleted.find((p) => p.name === "Store");
                    const deletedTypeIds =
                        update_types.deleted.map(t => t.id);

                    if (storedTypesPresent) {
                        const validationinventory = await sequelize.query(
                            `SELECT func_is_location_has_inventory(:id) AS has_inventory;`, {
                            replacements: { id: id },
                            type: QueryTypes.SELECT
                        })

                        interface ValidationInventory {
                            has_inventory: boolean;
                        }
                        const { has_inventory }: ValidationInventory =
                            validationinventory[0] as ValidationInventory;

                        if (has_inventory) {
                            await transaction.rollback();
                            res.status(400).json({
                                validation:
                                    "The location cannot have the Store type "
                                    + "deleted because it has inventory assigned"
                            });
                            return;
                        }
                    }

                    await LocationLocationTypeModel.destroy({
                        where: {
                            location_id: id,
                            location_type_id: deletedTypeIds,
                        },
                        transaction,
                    });
                }
            }

            await transaction.commit();

            res.status(200).json({
                message:
                    "Location updated successfully"
            });
        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`
                );
            }
        }
    }
}

export default LocationController;