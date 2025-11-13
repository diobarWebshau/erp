import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { LocationModel, LocationTypeModel, LocationLocationTypeModel, ProductionLineModel, LocationsProductionLinesModel, ProductionLineProductModel, ProductModel, ProductProcessModel, ProcessModel, ProductionLineQueueModel, ProductionOrderModel, ProductionModel } from "../../../associations.js";
import { Op, QueryTypes, Transaction } from "sequelize";
class LocationController {
    static getAll = async (req, res, next) => {
        try {
            const response = await LocationModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Locations no found" });
                return;
            }
            const locations = response.map(l => l.toJSON());
            res.status(200).json(locations);
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
    static getAllWithFilters = async (req, res, next) => {
        const { filter, ...rest } = req.query;
        try {
            // 1️⃣ Condición base (para exclusiones)
            const excludePerField = Object.fromEntries(Object.entries(rest)
                .filter(([k, v]) => v !== undefined && k !== "name")
                .map(([k, v]) => [
                k,
                Array.isArray(v) ? { [Op.notIn]: v } : { [Op.ne]: v },
            ]));
            // 2️⃣ Filtro de búsqueda general
            const filterConditions = [];
            if (filter && filter.trim()) {
                const f = `%${filter.trim()}%`; // busca en cualquier parte
                filterConditions.push({ name: { [Op.like]: f } }, // name del shipping order
                { street: { [Op.like]: f } }, { city: { [Op.like]: f } }, { state: { [Op.like]: f } }, { country: { [Op.like]: f } }, { description: { [Op.like]: f } }, { phone: { [Op.like]: f } });
            }
            // 3️⃣ Construimos el WHERE principal
            const where = {
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
                                                        sequelize.fn("func_get_order_of_production_order", sequelize.col("production_order.id"), // ✅ usa alias local
                                                        sequelize.col("production_order.order_id"), // ✅ usa alias local
                                                        sequelize.col("production_order.order_type")),
                                                        "order"
                                                    ],
                                                    [
                                                        sequelize.fn("func_get_order_progress_snapshot", sequelize.col("production_order.id")),
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
    static getLocationWithAllInformation = async (req, res, next) => {
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
                                                        sequelize.fn("func_get_order_of_production_order", sequelize.col("production_order.id"), // ✅ usa alias local
                                                        sequelize.col("production_order.order_id"), // ✅ usa alias local
                                                        sequelize.col("production_order.order_type")),
                                                        "order"
                                                    ],
                                                    [
                                                        sequelize.fn("func_get_order_progress_snapshot", sequelize.col("production_order.id")),
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
            if (!response) {
                res.status(200).json([]);
                return;
            }
            const data = response.toJSON();
            res.status(200).json(data);
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
    static getAllWithTypes = async (req, res, next) => {
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
            // Aquí convertimos el resultado de Sequelize a objeto plano
            const data = responseLocations.map((l) => l.toJSON());
            // Mapeamos los tipos desde la relación pivote
            const dataWithTypes = data.map((d) => {
                const types = d.location_location_type?.map((rel) => rel.location_type) || [];
                delete d.location_location_type;
                d.types = types;
                return d;
            });
            res.status(200).json(dataWithTypes);
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
    static getTypesOfLocation = async (req, res, next) => {
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
            // Aquí convertimos el resultado de Sequelize a objeto plano
            const data = location.toJSON();
            // Mapeamos los tipos desde la relación pivote
            const types = data.location_location_type?.map((rel) => rel.location_type) || [];
            // Eliminamos la relación pivote para devolver solo 'types'
            delete data.location_location_type;
            data.types = types;
            res.status(200).json(data);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error("Unexpected error:", error);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await LocationModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "Location no found" });
                return;
            }
            const location = response.toJSON();
            res.status(200).json(location);
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
    static getByName = async (req, res, next) => {
        const { name } = req.params;
        try {
            const response = await LocationModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Location no found" });
                return;
            }
            const location = response.toJSON();
            res.status(200).json(location);
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
    static getLocationsProducedOneProduct = async (req, res, next) => {
        const { product_id } = req.params;
        try {
            const response = await sequelize.query("SELECT func_get_product_production_locations_with_inventory(:product_id) AS production_locations", {
                replacements: { product_id: product_id },
                type: QueryTypes.SELECT,
            });
            const locations = response[0].production_locations;
            res.status(200).send(locations);
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
    static getProductionLinesForProductAtLocation = async (req, res, next) => {
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
    static getInventoryInputsOfProductInOneLocation = async (req, res, next) => {
        const { product_id, location_id } = req.params;
        try {
            const response = await sequelize.query("SELECT func_get_inventory_locations_for_Inputs_of_product(:product_id, :location_id) AS inventory_inputs", {
                replacements: { product_id: product_id, location_id: location_id },
                type: QueryTypes.SELECT,
            });
            const inventory_inputs = response[0].inventory_inputs;
            res.status(200).json(inventory_inputs);
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
        const { name, description, street, street_number, neighborhood, city, state, country, zip_code, is_active, phone } = req.body;
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
                street,
                street_number,
                neighborhood,
                city,
                state,
                country,
                zip_code,
                phone,
                is_active: is_active || 1,
            });
            if (!response) {
                res.status(200).json({ message: "The location could not be created" });
                return;
            }
            res.status(201).json({ message: "Location created successfully" });
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
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const editableFields = LocationModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "There are no validated location properties for the update."
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
                        validation: "The name is already currently in use by a location"
                    });
                    return;
                }
            }
            const response = await LocationModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (!(response[0] > 0)) {
                res.status(400).json({
                    validation: "No changes were made to the location"
                });
                return;
            }
            res.status(200).json({
                message: "Location updated succefally"
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
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validationinventory = await sequelize.query(`SELECT func_is_location_has_inventory(:id) AS has_inventory;`, {
                replacements: { id: id },
                type: QueryTypes.SELECT
            });
            const { has_inventory } = validationinventory[0];
            if (has_inventory) {
                res.status(400).json({
                    validation: "The location cannot be deleted because "
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
                    validation: "Location not found for deleted"
                });
                return;
            }
            res.status(200).json({
                message: "Location deleted successfully"
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
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        const { name, description, types, phone, city, state, country, is_active, street, street_number, neighborhood, zip_code } = req.body;
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
                    validation: "The name is already currently in use by a location"
                });
                return;
            }
            // Crear ubicación
            const response = await LocationModel.create({
                name,
                description,
                street,
                street_number,
                neighborhood,
                zip_code,
                phone,
                city,
                state,
                country,
                is_active: is_active ? 1 : 0
            }, { transaction });
            if (!response) {
                await transaction.rollback();
                res.status(400).json({
                    message: "The location could not be created"
                });
                return;
            }
            const location = response.toJSON();
            if (!types || types.length === 0) {
                await transaction.rollback();
                res.status(400).json({
                    message: "Location types are required for location creation"
                });
                return;
            }
            // Validar que todos los location_types existen (una sola consulta)
            const typeIds = types.filter((t) => t?.id !== undefined)
                .map((t) => t.id);
            const existingTypes = await LocationTypeModel.findAll({
                where: { id: { [Op.in]: typeIds } },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (existingTypes.length !== types.length) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "Some of the assigned location types do not exist"
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
                    validation: "Some types have already been assigned to the location"
                });
                return;
            }
            // Crear las asignaciones en bulk
            const typesToCreate = types.map(type => ({
                location_type_id: type.id,
                location_id: location.id
            }));
            const created = await LocationLocationTypeModel.bulkCreate(typesToCreate, { transaction });
            if (!created || created.length === 0) {
                await transaction.rollback();
                res.status(500).json({
                    validation: "The types could not be assigned to the location"
                });
                return;
            }
            await transaction.commit();
            res.status(201).json({
                message: "Location created successfully"
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
                res.status(500).json({
                    message: "Unexpected error occurred"
                });
            }
        }
    };
    static updateComplete = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        const { update_fields, update_types } = req.body;
        const { id } = req.params;
        try {
            const validatedLocation = await LocationModel.findOne({ where: { id: id } });
            if (!validatedLocation) {
                await transaction.rollback();
                res.status(404).json({
                    validation: "Location not found"
                });
                return;
            }
            const editableFields = LocationModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, update_fields);
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
                            validation: `The name is already currently `
                                + `in use by a location`
                        });
                        return;
                    }
                }
                const responseLocation = await LocationModel.update(update_values, {
                    where: { id: id },
                    individualHooks: true,
                    transaction: transaction
                });
                if (!responseLocation) {
                    await transaction.rollback();
                    res.status(400).json({
                        validation: "The location could not be updated"
                    });
                    return;
                }
            }
            const flagTypesUpdate = (update_types.added.length > 0
                || update_types.deleted.length > 0
                || update_types.modified.length > 0);
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
                            validation: `Some of the assigned location types do`
                                + ` not exist`,
                        });
                        return;
                    }
                    const alreadyAssigned = await LocationLocationTypeModel.findAll({
                        where: {
                            location_id: id,
                            location_type_id: typeIds,
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE,
                    });
                    if (alreadyAssigned.length > 0) {
                        await transaction.rollback();
                        res.status(409).json({
                            validation: `Some types have already been assigned `
                                + `to the location`,
                        });
                        return;
                    }
                    const assignments = typeIds.map((typeId) => ({
                        location_id: Number(id),
                        location_type_id: typeId,
                    }));
                    await LocationLocationTypeModel.bulkCreate(assignments, { transaction });
                }
                if (update_types.deleted.length > 0) {
                    const storedTypesPresent = update_types.deleted.find((p) => p.name === "Store");
                    const deletedTypeIds = update_types.deleted.map(t => t.id);
                    if (storedTypesPresent) {
                        const validationinventory = await sequelize.query(`SELECT func_is_location_has_inventory(:id) AS has_inventory;`, {
                            replacements: { id: id },
                            type: QueryTypes.SELECT
                        });
                        const { has_inventory } = validationinventory[0];
                        if (has_inventory) {
                            await transaction.rollback();
                            res.status(400).json({
                                validation: "The location cannot have the Store type "
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
                message: "Location updated successfully"
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
}
export default LocationController;
