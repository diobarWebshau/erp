import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import sequelize from "../../../../mysql/configSequelize.js";
import {
    LocationModel, LocationTypeModel, LocationLocationTypeModel,
    ProductionLineModel, LocationsProductionLinesModel, ProductionLineProductModel,
    ProductModel, ProductProcessModel, ProcessModel, ProductionLineQueueModel,
    ProductionOrderModel, ProductionModel,
    InventoryModel,
    InputModel,
    ItemModel
} from "../../../associations.js";
import {
    LocationAttributes, LocationCreateAttributes, LocationLocationTypeAttributes,
    LocationLocationTypeCreateAttributes,
    LocationTypeAttributes
} from "../types.js";
import { Response, Request, NextFunction } from "express";
import { Op, QueryTypes, Transaction } from "sequelize";
import { normalizeValidationArray } from "../../../../helpers/normalizeValidationArray.js";
import InventoryLocationItemModel, { InventoryLocationItemCreationAttributes, InventoryLocationItemManager } from "../../../../modules/services/inventories/models/references/inventories_locations_items.model.js";
import { LocationLocationTypeManager } from "../models/junctions/locations-location-types.model.js";
import { LocationsProductionLinesCreateAttributes, ProductionLineCreationAttributes, ProductionLineProductCreateAttributes } from "../../../types.js";
import { LocationsProductionLinesManager } from "../../../../modules/features/productions/models/junctions/locations-production-lines.model.js";

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



    static getAllWithFilters = async (req: Request, res: Response, next: NextFunction) => {
        const { filter, ...rest } = req.query as {
            filter?: string;
        } & Partial<LocationAttributes>;
        try {

            // 1️⃣ Condición base (para exclusiones)
            const excludePerField = Object.fromEntries(
                Object.entries(rest)
                    .filter(([k, v]) => v !== undefined && k !== "name")
                    .map(([k, v]) => [
                        k,
                        Array.isArray(v) ? { [Op.notIn]: v } : { [Op.ne]: v },
                    ])
            );

            // 2️⃣ Filtro de búsqueda general
            const filterConditions: any[] = [];
            if (filter && filter.trim()) {
                const f = `%${filter.trim()}%`; // busca en cualquier parte
                filterConditions.push(
                    { name: { [Op.like]: f } }, // name del shipping order
                    { street: { [Op.like]: f } },
                    { city: { [Op.like]: f } },
                    { state: { [Op.like]: f } },
                    { country: { [Op.like]: f } },
                    { description: { [Op.like]: f } },
                    { phone: { [Op.like]: f } },
                );
            }

            // 3️⃣ Construimos el WHERE principal
            const where: any = {
                ...excludePerField,
                ...(filterConditions.length > 0 ? { [Op.or]: filterConditions } : {}),
            };

            console.log(`where`, where);

            const response = await LocationModel.findAll({
                where,
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
                                        model: ProductionLineQueueModel,
                                        as: "production_line_queue",
                                        required: false,
                                        attributes: ProductionLineQueueModel.getAllFields(),
                                        separate: true, // 👈 esto permite que order funcione dentro del include
                                        order: [["position", "ASC"]],
                                        where: {
                                            position: {
                                                [Op.ne]: null
                                            }
                                        },
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
                                                    ],
                                                    [
                                                        sequelize.fn(
                                                            "func_get_order_progress_snapshot",
                                                            sequelize.col("production_order.id"),
                                                        ),
                                                        "production_breakdown"
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
                            }
                        ],
                    },
                    {
                        model: LocationLocationTypeModel,
                        as: "location_location_type",
                        required: false,
                        attributes: LocationLocationTypeModel.getAllFields(),
                        include: [
                            {
                                model: LocationTypeModel,
                                as: "location_type",
                                required: false,
                                attributes: LocationTypeModel.getAllFields(),
                            }
                        ]
                    }
                ],
            });
            if (!(response.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const data = response.map(l => l.toJSON());
            res.status(200).json(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };

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
                                        model: ProductionLineQueueModel,
                                        as: "production_line_queue",
                                        required: false,
                                        attributes: ProductionLineQueueModel.getAllFields(),
                                        separate: true,
                                        order: [["position", "ASC"]],
                                        where: { position: { [Op.ne]: null } },
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
                                                            sequelize.col("production_order.id"),
                                                            sequelize.col("production_order.order_id"),
                                                            sequelize.col("production_order.order_type")
                                                        ),
                                                        "order"
                                                    ],
                                                    [
                                                        sequelize.fn(
                                                            "func_get_order_progress_snapshot",
                                                            sequelize.col("production_order.id")
                                                        ),
                                                        "production_breakdown"
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
                                            }
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
                            }
                        ]
                    },
                    {
                        model: LocationLocationTypeModel,
                        as: "location_location_type",
                        required: false,
                        attributes: LocationLocationTypeModel.getAllFields(),
                        include: [
                            {
                                model: LocationTypeModel,
                                as: "location_type",
                                required: false,
                                attributes: LocationTypeModel.getAllFields(),
                            }
                        ]
                    },
                    {
                        model: InventoryLocationItemModel,
                        attributes: InventoryLocationItemModel.getAllFields(),
                        as: "inventories_locations_items",
                        include: [
                            {
                                model: InventoryModel,
                                attributes: InventoryModel.getAllFields(),
                                as: "inventory",
                            },

                            // 🔵 ITEM POLIMÓRFICO
                            {
                                model: ItemModel,
                                as: "item",
                                required: false,
                                on: {
                                    item_id: {
                                        [Op.col]: "inventories_locations_items.item_id",
                                    },
                                    item_type: {
                                        [Op.col]: "inventories_locations_items.item_type",
                                    },
                                },
                            },
                        ],
                    },
                ],
            });

            if (!response) {
                res.status(200).json([]);
                return;
            }

            // Convertimos a JSON (Item aún NO tiene item.item)
            const data = response.toJSON();

            // 🔵 Resolver productos/insumos polimórficos dentro de inventories_locations_items
            if (data.inventories_locations_items) {
                for (const ili of data.inventories_locations_items) {
                    if (ili.item) {
                        const instance = ItemModel.build(ili.item);
                        ili.item = {
                            ...ili.item,
                            item: await instance.resolveItem(),   // ⬅️ aquí se trae el product/input real
                        };
                    }
                }
            }

            res.status(200).json(data);

        } catch (error: unknown) {
            if (error instanceof Error) next(error);
            else console.error("Unexpected error", error);
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
            const response = await LocationModel.findByPk(id, {
                attributes: LocationModel.getAllFields(),
                include: [
                    {
                        model: LocationsProductionLinesModel,
                        attributes: LocationsProductionLinesModel.getAllFields(),
                        as: "location_production_line",
                        include: [
                            {
                                model: ProductionLineModel,
                                attributes: ProductionLineModel.getAllFields(),
                                as: "production_line",
                                include: [
                                    {
                                        model: ProductionLineProductModel,
                                        attributes: ProductionLineProductModel.getAllFields(),
                                        as: "production_lines_products",
                                    },
                                ],
                            },
                            {
                                model: LocationModel,
                                attributes: LocationModel.getAllFields(),
                                as: "location",
                            },
                        ],
                    },
                    {
                        model: LocationLocationTypeModel,
                        attributes: LocationLocationTypeModel.getAllFields(),
                        as: "location_location_type",
                        include: [
                            {
                                model: LocationTypeModel,
                                attributes: LocationTypeModel.getAllFields(),
                                as: "location_type",
                            },
                        ],
                    },
                    {
                        model: InventoryLocationItemModel,
                        attributes: InventoryLocationItemModel.getAllFields(),
                        as: "inventories_locations_items",
                        include: [
                            {
                                model: InventoryModel,
                                attributes: InventoryModel.getAllFields(),
                                as: "inventory",
                            },

                            // 🔵 ITEM POLIMÓRFICO
                            {
                                model: ItemModel,
                                as: "item",
                                required: false,
                                on: {
                                    item_id: {
                                        [Op.col]: "inventories_locations_items.item_id",
                                    },
                                    item_type: {
                                        [Op.col]: "inventories_locations_items.item_type",
                                    },
                                },
                            },
                        ],
                    },
                ],
            });

            if (!response) {
                res.status(404).json({
                    validation: "Location not found",
                });
                return;
            }

            // Convertimos a JSON (pero item todavía NO está resuelto)
            const location = response.toJSON();

            // ⬇️⬇️⬇️ CORRECCIÓN CRÍTICA: resolver polimorfismo ⬇️⬇️⬇️
            if (location.inventories_locations_items) {
                for (const ili of location.inventories_locations_items) {
                    if (ili.item) {
                        // Forzamos la instancia para disparar resolveItem()
                        const instance = ItemModel.build(ili.item);
                        ili.item = {
                            ...ili.item,
                            item: await instance.resolveItem(),
                        };
                    }
                }
            }
            // ⬆️⬆️⬆️ SIN ESTO item.item NUNCA APARECERÁ ⬆️⬆️⬆️

            res.status(200).json(location);

        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred ${error}`);
            }
        }
    };

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
                "SELECT func_get_product_production_locations_with_inventory(:product_id) AS production_locations",
                {
                    replacements: { product_id: product_id },
                    type: QueryTypes.SELECT,
                }
            );
            const locations: LocationAttributes[] = response[0].production_locations;
            res.status(200).send(locations);
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
        const {
            name, description, phone, city, state, country,
            is_active, street, street_number, neighborhood,
            zip_code, production_capacity, custom_id, location_manager
        } = req.body;
        try {
            const validateName = await LocationModel.findOne({ where: { name: name } });
            if (validateName) {
                res.status(200).json({
                    validation: "The name is already currently in use by a location"
                });
                return;
            }
            const response = await LocationModel.create({
                name: name ?? null,
                description: description ?? null,
                street: street ?? null,
                street_number: street_number ?? null,
                neighborhood: neighborhood ?? null,
                zip_code: zip_code ?? null,
                phone: phone ?? null,
                city: city ?? null,
                state: state ?? null,
                country: country ?? null,
                is_active: is_active ?? 1,
                production_capacity: production_capacity ?? null,
                custom_id: custom_id ?? null,
                location_manager: location_manager ?? null
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

    static createComplete = async (req: Request, res: Response, next: NextFunction) => {

        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        });

        const {
            name, description, types, phone, city,
            state, country, is_active, street,
            street_number, neighborhood, zip_code, production_capacity,
            inventories_locations_items, location_location_type,
            location_production_line, custom_id, location_manager
        } = req.body;

        try {
            // Validar nombre único de ubicación
            const validateName = await LocationModel.findOne({
                where: { name },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (validateName) {
                await transaction.rollback();
                res.status(409).json({
                    validation: normalizeValidationArray([
                        "The name is already currently in use by a location"
                    ])
                });
                return;
            }

            // Crear ubicación
            const response = await LocationModel.create({
                name: name ?? null,
                description: description ?? null,
                street: street ?? null,
                street_number: street_number ?? null,
                neighborhood: neighborhood ?? null,
                zip_code: zip_code ?? null,
                phone: phone ?? null,
                city: city ?? null,
                state: state ?? null,
                country: country ?? null,
                is_active: is_active ?? 1,
                production_capacity: production_capacity ?? null,
                custom_id: custom_id ?? null,
                location_manager: location_manager ?? null
            }, { transaction });

            if (!response) {
                await transaction.rollback();
                res.status(500).json({
                    message: normalizeValidationArray([
                        "The location could not be created"
                    ])
                });
                return;
            }

            const location = response.toJSON();

            if (location_production_line && location_production_line?.length) {

                const productionLineAssigned: LocationsProductionLinesCreateAttributes[] = location_production_line.filter((lpl: LocationsProductionLinesCreateAttributes) => lpl.production_line_id);
                const productionLineNew: LocationsProductionLinesCreateAttributes[] = location_production_line.filter((lpl: LocationsProductionLinesCreateAttributes) => !lpl.production_line_id);
                const locationProductionLineBulk: LocationsProductionLinesCreateAttributes[] = [];

                if (productionLineAssigned.length) {
                    const locations_production_lines = productionLineAssigned.map((lpl: LocationsProductionLinesCreateAttributes): LocationsProductionLinesCreateAttributes => ({
                        location_id: location.id,
                        production_line_id: lpl.production_line_id,
                    }));
                    locationProductionLineBulk.push(...locations_production_lines);
                }

                if (productionLineNew.length) {

                    for (const lpl of productionLineNew) {

                        const productionLines: ProductionLineCreationAttributes = ({
                            name: lpl.production_line?.name ?? null,
                            custom_id: lpl.production_line?.custom_id ?? null,
                            is_active: lpl.production_line?.is_active ?? true
                        });

                        const validateProductionLineName = await ProductionLineModel.findOne({
                            where: { name: productionLines.name },
                            transaction
                        });

                        if (validateProductionLineName) {
                            transaction.rollback();
                            res.status(409).json({
                                validation: normalizeValidationArray([
                                    "Una de las nuevas lineas, tiene un nombre ya usado por otra línea."
                                ])
                            });
                        }

                        const responseProductionLine = await ProductionLineModel.create(productionLines, { transaction });

                        if (!responseProductionLine) {
                            transaction.rollback();
                            res.status(500).json({
                                validation: normalizeValidationArray([
                                    "No se pudo crear las lineas de producción para la ubicación"
                                ])
                            });
                        }

                        const production_line_db = responseProductionLine.toJSON();

                        const locations_production_lines: LocationsProductionLinesCreateAttributes = {
                            location_id: location.id,
                            production_line_id: production_line_db.id,
                        }

                        const production_line_products: ProductionLineProductCreateAttributes[] = lpl.production_line?.production_lines_products ?? [];

                        if (production_line_products && production_line_products.length) {
                            const production_lines_products_news = production_line_products.map((r: ProductionLineProductCreateAttributes): ProductionLineProductCreateAttributes => ({
                                production_line_id: production_line_db.id,
                                product_id: r.product_id
                            }));

                            const responseProductionLineProducts = await ProductionLineProductModel.bulkCreate(production_lines_products_news, {
                                transaction,
                                individualHooks: true
                            });

                            if (responseProductionLineProducts.length !== production_lines_products_news.length) {
                                transaction.rollback();
                                res.status(500).json({
                                    validation: normalizeValidationArray([
                                        "No se pudo crear la asignacion de los productos a la linea de producción nueva para la ubiacion."
                                    ])
                                });
                            }

                        }

                        locationProductionLineBulk.push(locations_production_lines);
                    }
                }

                const responseLocationProductionLine =
                    await LocationsProductionLinesModel.bulkCreate(locationProductionLineBulk, { transaction });

                if (responseLocationProductionLine.length !== locationProductionLineBulk.length) {
                    transaction.rollback();
                    res.status(500).json({
                        validation: normalizeValidationArray([
                            "No se pudo crear la asignacion de la nueva línea de producción a la nueva ubicación"
                        ])
                    });
                }

            }

            if (inventories_locations_items && inventories_locations_items?.length) {

                const inventoriesLocationsItems = inventories_locations_items as InventoryLocationItemCreationAttributes[]

                for (const ili of inventoriesLocationsItems) {

                    const responseGetItem = await ItemModel.findOne({
                        where: {
                            item_type: ili.item?.item_type,
                            item_id: ili.item?.item?.id,
                        },
                        transaction
                    });

                    const itemRecord = responseGetItem?.toJSON();

                    const inventories_locations_items_aux: InventoryLocationItemCreationAttributes = {
                        location_id: ili.location_id,
                        location: ili.location,
                        item_id: itemRecord?.id,
                        item: ili.item?.item,
                        item_type: itemRecord?.item_type,
                    };

                    const validateExist = await InventoryLocationItemModel.findOne({
                        where: {
                            location_id: location.id,
                            item_type: inventories_locations_items_aux.item_type,
                            item_id: inventories_locations_items_aux.item_id
                        },
                        transaction: transaction
                    });

                    if (validateExist) {
                        await transaction.rollback();
                        res.status(409).json({
                            message: normalizeValidationArray([
                                "Uno de los productos ya fue previamente asignado"
                            ])
                        });
                        return;
                    }

                    const responseCreateInventory = await InventoryModel.create({
                        stock: 0,
                        maximum_stock: 10000,
                        minimum_stock: 100,
                        lead_time: 100,
                    }, { transaction: transaction });

                    if (!responseCreateInventory) {
                        await transaction.rollback();
                        res.status(500).json({
                            message: normalizeValidationArray([
                                "No se pudo crear el registro del inventario para inventories-location-item"
                            ])
                        });
                        return;
                    }

                    const inventory = responseCreateInventory.toJSON();

                    const newInventoryLocationItem: InventoryLocationItemCreationAttributes = {
                        inventory_id: inventory.id,
                        item_id: inventories_locations_items_aux.item_id,
                        item_type: inventories_locations_items_aux.item_type,
                        location_id: location.id,
                    }

                    const responseCreateInventoryLocationItem = await InventoryLocationItemModel.create(newInventoryLocationItem, {
                        transaction: transaction,
                        individualHooks: true
                    });

                    if (!responseCreateInventoryLocationItem) {
                        await transaction.rollback();
                        res.status(500).json({
                            message: normalizeValidationArray([
                                "No se pudo crear el registro de inventories-location-item"
                            ])
                        });
                        return;
                    }
                }
            }

            if (location_location_type && location_location_type?.length) {

                // Validar que todos los location_types existen (una sola consulta)
                const typeIds = location_location_type.filter((t: LocationLocationTypeCreateAttributes) => t?.location_type_id !== undefined)
                    .map((t: LocationLocationTypeCreateAttributes) => t.location_type_id as number);

                const existingTypes = await LocationTypeModel.findAll({
                    where: { id: { [Op.in]: typeIds } },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (existingTypes.length !== location_location_type.length) {
                    await transaction.rollback();
                    res.status(409).json({
                        validation: normalizeValidationArray([
                            "Some of the assigned location types do not exist"
                        ])
                    });
                    return;
                }

                // Verificar si alguno ya está asignado a esa ubicación
                const existingAssignments = await LocationLocationTypeModel.findAll({
                    where: {
                        location_id: location.id,
                        location_type_id: {
                            [Op.in]: typeIds
                        },
                    },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (existingAssignments.length > 0) {
                    await transaction.rollback();
                    res.status(409).json({
                        validation: normalizeValidationArray([
                            "Some types have already been assigned to the location"
                        ])
                    });
                    return;
                }

                // Crear las asignaciones en bulk
                const typesToCreate: LocationLocationTypeCreateAttributes[] = location_location_type.map((type: LocationLocationTypeCreateAttributes): LocationLocationTypeCreateAttributes => ({
                    location_type_id: type.location_type_id,
                    location_id: location.id,
                }));

                const created = await LocationLocationTypeModel.bulkCreate(typesToCreate, {
                    transaction,
                    individualHooks: true
                });

                if (!created || created.length === 0) {
                    await transaction.rollback();
                    res.status(500).json({
                        validation: normalizeValidationArray([
                            "The types could not be assigned to the location"
                        ])
                    });
                    return;
                }

            }
            await transaction.commit();
            res.status(201).json({});
        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) next(error);
            else console.error(`An unexpected error occurred: ${error}`);
        }
    };


    static updateComplete = async (req: Request, res: Response, next: NextFunction) => {

        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        });
        const { id } = req.params;
        const completeBody = req.body as LocationCreateAttributes;

        try {

            const validatedLocation = await LocationModel.findOne({ where: { id: id } });

            if (!validatedLocation) {
                await transaction.rollback();
                res.status(404).json({
                    validation: normalizeValidationArray([ 
                    "Location not found"
                    ])
                });
                return;
            }
            const location = validatedLocation.toJSON();

            const editableFields = LocationModel.getEditableFields();
            const update_values: LocationCreateAttributes = collectorUpdateFields(editableFields, completeBody);

            console.log('update_values', update_values);

            if (Object.keys(update_values).length > 0) {
                console.log('entro a actualizar object');
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
                            validation: normalizeValidationArray([
                                `The name is already currently `
                                + `in use by a location`
                            ])
                        });
                        return;
                    }
                }

                const responseLocation = await LocationModel.update(update_values, {
                    where: { id: id },
                    individualHooks: true,
                    transaction: transaction
                },);

                if (!responseLocation) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation:
                            "The location could not be updated"
                    });
                    return;
                }
            }

            if (completeBody?.inventories_locations_items_updated) {

                const inventoriesLocationsItemsObject: InventoryLocationItemManager =
                    completeBody.inventories_locations_items_updated;

                const flagProductsInputsUpdate: boolean = [
                    inventoriesLocationsItemsObject.added,
                    inventoriesLocationsItemsObject.deleted,
                    inventoriesLocationsItemsObject.modified
                ].some((p) => p.length);

                if (flagProductsInputsUpdate) {

                    const adds: InventoryLocationItemCreationAttributes[] =
                        inventoriesLocationsItemsObject.added;
                    const deletes: InventoryLocationItemCreationAttributes[] =
                        inventoriesLocationsItemsObject.deleted;
                    const modifies: InventoryLocationItemCreationAttributes[] =
                        inventoriesLocationsItemsObject.modified;

                    if (adds.length) {
                        const inventoriesLocationsItems = adds as InventoryLocationItemCreationAttributes[]

                        for (const ili of inventoriesLocationsItems) {

                            const responseGetItem = await ItemModel.findOne({
                                where: {
                                    item_type: ili.item?.item_type,
                                    item_id: ili.item?.item?.id,
                                },
                                transaction
                            });

                            const itemRecord = responseGetItem?.toJSON();

                            const inventories_locations_items_aux: InventoryLocationItemCreationAttributes = {
                                location_id: ili.location_id,
                                location: ili.location,
                                item_id: itemRecord?.id,
                                item: ili.item?.item,
                                item_type: itemRecord?.item_type,
                            };

                            const validateExist = await InventoryLocationItemModel.findOne({
                                where: {
                                    location_id: location.id,
                                    item_type: inventories_locations_items_aux.item_type,
                                    item_id: inventories_locations_items_aux.item_id
                                },
                                transaction: transaction
                            });

                            if (validateExist) {
                                await transaction.rollback();
                                res.status(409).json({
                                    message: normalizeValidationArray([
                                        "Uno de los productos ya fue previamente asignado"
                                    ])
                                });
                                return;
                            }

                            const responseCreateInventory = await InventoryModel.create({
                                stock: 0,
                                maximum_stock: 10000,
                                minimum_stock: 100,
                                lead_time: 100,
                            }, { transaction: transaction });

                            if (!responseCreateInventory) {
                                await transaction.rollback();
                                res.status(500).json({
                                    message: normalizeValidationArray([
                                        "No se pudo crear el registro del inventario para inventories-location-item"
                                    ])
                                });
                                return;
                            }

                            const inventory = responseCreateInventory.toJSON();

                            const newInventoryLocationItem: InventoryLocationItemCreationAttributes = {
                                inventory_id: inventory.id,
                                item_id: inventories_locations_items_aux.item_id,
                                item_type: inventories_locations_items_aux.item_type,
                                location_id: location.id,
                            }

                            const responseCreateInventoryLocationItem = await InventoryLocationItemModel.create(newInventoryLocationItem, {
                                transaction: transaction,
                                individualHooks: true
                            });

                            if (!responseCreateInventoryLocationItem) {
                                await transaction.rollback();
                                res.status(500).json({
                                    message: normalizeValidationArray([
                                        "No se pudo crear el registro de inventories-location-item"
                                    ])
                                });
                                return;
                            }
                        }
                    }
                    if (modifies.length) {

                        const modifiesFiltered: InventoryLocationItemCreationAttributes[] = modifies.filter(p => p.id !== undefined);
                        const modifyIds: number[] = modifiesFiltered.map(m => m.id as number);

                        const existingInventoryLocationItem = await InventoryLocationItemModel.findAll({
                            where: { id: modifyIds },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (existingInventoryLocationItem.length !== modifyIds.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    `Algunos registros de inventory-location-item que se intenta actualiazar no existe`
                                ])
                            });
                            return;
                        }

                        for (const ili of modifiesFiltered) {

                            const editableFields = InventoryLocationItemModel.getEditableFields();
                            const update_values = collectorUpdateFields(editableFields, ili) as InventoryLocationItemCreationAttributes;

                            if (Object.keys(update_values).length) {

                                const responseUpdateInventoryLocationItem = await InventoryLocationItemModel.update(update_values, {
                                    where: { id: ili.id },
                                    transaction: transaction,
                                    individualHooks: true
                                });

                                if (!responseUpdateInventoryLocationItem) {
                                    await transaction.rollback();
                                    res.status(500).json({
                                        validation: normalizeValidationArray([
                                            `No se pudo actualizar un registro de inventory-location-item`
                                        ])
                                    });
                                    return;
                                }

                            }
                        }
                    }
                    if (deletes.length) {

                        const deletesFiltered: InventoryLocationItemCreationAttributes[] = deletes.filter(p => p.id !== undefined);

                        const deleteIds: number[] = deletesFiltered.map(p => p.id as number);

                        const validateInventoryLocationItem = await InventoryLocationItemModel.findAll({
                            where: { id: deleteIds },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (validateInventoryLocationItem.length !== deleteIds.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    "Alguno de los registros inventoryLocationItem que se intenta eliminar no existe"
                                ])
                            });
                            return;
                        }

                        const deletedCount: number = await InventoryLocationItemModel.destroy({
                            where: { id: deleteIds },
                            transaction,
                            individualHooks: true
                        });

                        const allDeleted: boolean = deletedCount === deleteIds.length;

                        if (!allDeleted) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation: normalizeValidationArray([
                                    `No se pudo eliminar los registros inventoryLocationItem`
                                ])
                            });
                            return;
                        }
                    }
                }
            }

            if (completeBody?.location_production_line_updated) {

                const locationProductionLineObject: LocationsProductionLinesManager =
                    completeBody?.location_production_line_updated ?? [];

                const flagLocationProductionLineUpdate: boolean = [
                    locationProductionLineObject.added,
                    locationProductionLineObject.deleted,
                    locationProductionLineObject.modified
                ].some((p) => p.length);

                if (flagLocationProductionLineUpdate) {

                    const adds: LocationsProductionLinesCreateAttributes[] =
                        locationProductionLineObject.added;
                    const deletes: LocationsProductionLinesCreateAttributes[] =
                        locationProductionLineObject.deleted;
                    const modifies: LocationsProductionLinesCreateAttributes[] =
                        locationProductionLineObject.modified;

                    if (adds.length) {

                        const productionLineAssigned: LocationsProductionLinesCreateAttributes[] = adds.filter((lpl: LocationsProductionLinesCreateAttributes) => lpl.production_line_id);
                        const productionLineNew: LocationsProductionLinesCreateAttributes[] = adds.filter((lpl: LocationsProductionLinesCreateAttributes) => !lpl.production_line_id);
                        const locationProductionLineBulk: LocationsProductionLinesCreateAttributes[] = [];

                        if (productionLineAssigned.length) {
                            const locations_production_lines = productionLineAssigned.map((lpl: LocationsProductionLinesCreateAttributes): LocationsProductionLinesCreateAttributes => ({
                                location_id: location.id,
                                production_line_id: lpl.production_line_id,
                            }));
                            locationProductionLineBulk.push(...locations_production_lines);
                        }

                        if (productionLineNew.length) {

                            for (const lpl of productionLineNew) {

                                const productionLines: ProductionLineCreationAttributes = ({
                                    name: lpl.production_line?.name ?? null,
                                    custom_id: lpl.production_line?.custom_id ?? null,
                                    is_active: lpl.production_line?.is_active ?? true
                                });

                                const validateProductionLineName = await ProductionLineModel.findOne({
                                    where: { name: productionLines.name },
                                    transaction
                                });

                                if (validateProductionLineName) {
                                    transaction.rollback();
                                    res.status(409).json({
                                        validation: normalizeValidationArray([
                                            "Una de las nuevas lineas, tiene un nombre ya usado por otra línea."
                                        ])
                                    });
                                }

                                const responseProductionLine = await ProductionLineModel.create(productionLines, { transaction });

                                if (!responseProductionLine) {
                                    transaction.rollback();
                                    res.status(500).json({
                                        validation: normalizeValidationArray([
                                            "No se pudo crear las lineas de producción para la ubicación"
                                        ])
                                    });
                                }

                                const production_line_db = responseProductionLine.toJSON();

                                const locations_production_lines: LocationsProductionLinesCreateAttributes = {
                                    location_id: location.id,
                                    production_line_id: production_line_db.id,
                                }

                                const production_line_products: ProductionLineProductCreateAttributes[] = lpl.production_line?.production_lines_products ?? [];

                                if (production_line_products && production_line_products.length) {
                                    const production_lines_products_news = production_line_products.map((r: ProductionLineProductCreateAttributes): ProductionLineProductCreateAttributes => ({
                                        production_line_id: production_line_db.id,
                                        product_id: r.product_id
                                    }));

                                    const responseProductionLineProducts = await ProductionLineProductModel.bulkCreate(production_lines_products_news, {
                                        transaction,
                                        individualHooks: true
                                    });

                                    if (responseProductionLineProducts.length !== production_lines_products_news.length) {
                                        transaction.rollback();
                                        res.status(500).json({
                                            validation: normalizeValidationArray([
                                                "No se pudo crear la asignacion de los productos a la linea de producción nueva para la ubiacion."
                                            ])
                                        });
                                    }

                                }

                                locationProductionLineBulk.push(locations_production_lines);
                            }
                        }

                        const responseLocationProductionLine =
                            await LocationsProductionLinesModel.bulkCreate(locationProductionLineBulk, { transaction });

                        if (responseLocationProductionLine.length !== locationProductionLineBulk.length) {
                            transaction.rollback();
                            res.status(500).json({
                                validation: normalizeValidationArray([
                                    "No se pudo crear la asignacion de la nueva línea de producción a la nueva ubicación"
                                ])
                            });
                        }
                    }

                    if (modifies.length) {
                        const modifiesFiltered: LocationsProductionLinesCreateAttributes[] = modifies.filter(p => p.id !== undefined);
                        const modifyIds: number[] = modifiesFiltered.map(m => m.id as number);

                        const existingLocationProductionLine = await InventoryLocationItemModel.findAll({
                            where: { id: modifyIds },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (existingLocationProductionLine.length !== modifyIds.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    `Algunos registros de LocationProductionLine que se intenta actualiazar no existe`
                                ])
                            });
                            return;
                        }

                        for (const lpl of modifiesFiltered) {

                            const editableFields = InventoryLocationItemModel.getEditableFields();
                            const update_values = collectorUpdateFields(editableFields, lpl) as LocationsProductionLinesCreateAttributes;

                            if (Object.keys(update_values).length) {

                                const responseUpdateLocationProductionLine = await LocationsProductionLinesModel.update(update_values, {
                                    where: { id: lpl.id },
                                    transaction: transaction,
                                    individualHooks: true
                                });

                                if (!responseUpdateLocationProductionLine) {
                                    await transaction.rollback();
                                    res.status(500).json({
                                        validation: normalizeValidationArray([
                                            `No se pudo actualizar un registro de LocationProductionLine`
                                        ])
                                    });
                                    return;
                                }

                            }
                        }
                    }

                    if (deletes.length) {

                        const deletesFiltered: LocationsProductionLinesCreateAttributes[] = deletes.filter(p => p.id !== undefined);
                        const deleteIds: number[] = deletesFiltered.map(p => p.id as number);

                        const validateLocationProductionLine = await LocationsProductionLinesModel.findAll({
                            where: { id: deleteIds },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (validateLocationProductionLine.length !== deleteIds.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    "Alguno de los registros LocationProductionLine que se intenta eliminar no existe"
                                ])
                            });
                            return;
                        }

                        const deletedCount: number = await LocationsProductionLinesModel.destroy({
                            where: { id: deleteIds },
                            transaction,
                            individualHooks: true
                        });

                        const allDeleted: boolean = deletedCount === deleteIds.length;

                        if (!allDeleted) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation: normalizeValidationArray([
                                    `No se pudo eliminar los registros LocationsProductionLines`
                                ])
                            });
                            return;
                        }
                    }
                }
            }


            if (completeBody?.location_location_type_updated) {
                const locationLocationTypeObject: LocationLocationTypeManager =
                    completeBody.location_production_line_updated as LocationLocationTypeManager;

                const flagProductsInputsUpdate: boolean = [
                    locationLocationTypeObject.added,
                    locationLocationTypeObject.deleted,
                    locationLocationTypeObject.modified
                ].some((p) => p.length);

                if (flagProductsInputsUpdate) {
                    const adds: InventoryLocationItemCreationAttributes[] =
                        locationLocationTypeObject.added;
                    const deletes: InventoryLocationItemCreationAttributes[] =
                        locationLocationTypeObject.deleted;
                    const modifies: InventoryLocationItemCreationAttributes[] =
                        locationLocationTypeObject.modified;

                    if (adds.length) {
                        // Validar que todos los location_types existen (una sola consulta)
                        const typeIds = adds.filter((t: LocationLocationTypeCreateAttributes) => t?.location_type_id !== undefined)
                            .map((t: LocationLocationTypeCreateAttributes) => t.location_type_id as number);

                        const existingTypes = await LocationTypeModel.findAll({
                            where: { id: { [Op.in]: typeIds } },
                            transaction,
                            lock: transaction.LOCK.UPDATE,
                        });

                        if (existingTypes.length !== adds.length) {
                            await transaction.rollback();
                            res.status(409).json({
                                validation: normalizeValidationArray([
                                    "Some of the assigned location types do not exist"
                                ])
                            });
                            return;
                        }

                        // Verificar si alguno ya está asignado a esa ubicación
                        const existingAssignments = await LocationLocationTypeModel.findAll({
                            where: {
                                location_id: location.id,
                                location_type_id: {
                                    [Op.in]: typeIds
                                },
                            },
                            transaction,
                            lock: transaction.LOCK.UPDATE,
                        });

                        if (existingAssignments.length > 0) {
                            await transaction.rollback();
                            res.status(409).json({
                                validation: normalizeValidationArray([
                                    "Some types have already been assigned to the location"
                                ])
                            });
                            return;
                        }

                        // Crear las asignaciones en bulk
                        const typesToCreate: LocationLocationTypeCreateAttributes[] = adds.map((type: LocationLocationTypeCreateAttributes): LocationLocationTypeCreateAttributes => ({
                            location_type_id: type.id as number,
                            location_id: location.id,
                        }));

                        const responseCreateLocationLocationType = await LocationLocationTypeModel.bulkCreate(typesToCreate, {
                            transaction,
                            individualHooks: true
                        });

                        if (!responseCreateLocationLocationType || responseCreateLocationLocationType.length) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation: normalizeValidationArray([
                                    "The types could not be assigned to the location"
                                ])
                            });
                            return;
                        }
                    }
                    if (modifies.length) {

                        const modifiesFiltered: LocationLocationTypeCreateAttributes[] = modifies.filter(p => p.id !== undefined);
                        const modifyIds: number[] = modifiesFiltered.map(m => m.id as number);

                        const existingLocationLocationType = await LocationLocationTypeModel.findAll({
                            where: { id: modifyIds },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (existingLocationLocationType.length !== modifyIds.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    `Algunos registros de LocationLocationType que se intenta actualiazar no existe`
                                ])
                            });
                            return;
                        }

                        for (const ili of modifiesFiltered) {

                            const editableFields = LocationLocationTypeModel.getEditableFields();
                            const update_values = collectorUpdateFields(editableFields, ili) as LocationLocationTypeCreateAttributes;

                            if (Object.keys(update_values).length) {

                                const responseUpdateInventoryLocationItem = await LocationLocationTypeModel.update(update_values, {
                                    where: { id: ili.id },
                                    transaction: transaction,
                                    individualHooks: true
                                });

                                if (responseUpdateInventoryLocationItem) {
                                    await transaction.rollback();
                                    res.status(500).json({
                                        validation: normalizeValidationArray([
                                            `No se pudo actualizar un registro de LocationLocationType`
                                        ])
                                    });
                                    return;
                                }

                            }
                        }

                    }
                    if (deletes.length) {

                        console.log(`location_location_types`,deletes)

                        const deletesFiltered: LocationLocationTypeCreateAttributes[] = deletes.filter(p => p.id !== undefined);

                        const deleteIds: number[] = deletesFiltered.map(p => p.id as number);

                        const validateLocationLocationType = await LocationLocationTypeModel.findAll({
                            where: { id: deleteIds },
                            transaction,
                            lock: transaction.LOCK.SHARE,
                        });

                        if (validateLocationLocationType.length !== deleteIds.length) {
                            await transaction.rollback();
                            res.status(404).json({
                                validation: normalizeValidationArray([
                                    "Alguno de los registros LocationLocationType que se intenta eliminar no existe"
                                ])
                            });
                            return;
                        }

                        const deletedCount: number = await InventoryLocationItemModel.destroy({
                            where: { id: deleteIds },
                            transaction,
                            individualHooks: true
                        });

                        const allDeleted: boolean = deletedCount === deleteIds.length;

                        if (!allDeleted) {
                            await transaction.rollback();
                            res.status(500).json({
                                validation: normalizeValidationArray([
                                    `No se pudo eliminar los registros LocationLocationType`
                                ])
                            });
                            return;
                        }
                    }
                }
            }
            await transaction.commit();
            res.status(200).json({});
        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) next(error);
            else console.error(`An unexpected error ocurred ${error}`);
        }
    }



    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
        });

        const { id } = req.params;
        try {

            const validationinventory = await sequelize.query(
                `SELECT func_is_location_has_inventory(:id) AS has_inventory;`, {
                replacements: { id: id },
                type: QueryTypes.SELECT,
                transaction: transaction
            })

            interface ValidationInventory {
                has_inventory: boolean;
            }
            const { has_inventory }: ValidationInventory =
                validationinventory[0] as ValidationInventory;

            if (has_inventory) {
                transaction.rollback();
                res.status(400).json({
                    validation: normalizeValidationArray([
                        "The location cannot be deleted because "
                        + "it has inventory assigned"
                    ])
                });
                return;
            }
            const response = await LocationModel.destroy({
                where: { id: id },
                individualHooks: true,
                transaction
            });

            if (!(response > 0)) {
                transaction.rollback();
                res.status(200).json({
                    validation: normalizeValidationArray([
                        "Location not found for deleted"
                    ])
                });
                return;
            }

            transaction.commit();

            res.status(200).json({});
        } catch (error: unknown) {
            transaction.rollback();
            if (error instanceof Error) next(error);
            else console.error(`An unexpected error ocurred: ${error} `);
        }
    }
}

export default LocationController;