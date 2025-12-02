import { normalizeValidationArray } from "../../../../helpers/normalizeValidationArray.js";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { formatWithBase64 } from "../../../../scripts/formatWithBase64.js";
import { InputModel, InputTypeModel } from "../../../associations.js";
import ImageHandler from "../../../../classes/ImageHandler.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { Op, QueryTypes, Transaction } from "sequelize";
import toBoolean from "../../../../scripts/toBolean.js";
class InputController {
    static getAll = async (req, res, next) => {
        try {
            const response = await InputModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const formattedInputs = await formatWithBase64(response, "photo");
            res.status(200).json(formattedInputs);
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
    static getByLikeExcludeIds = async (req, res, next) => {
        const raw = req.query.excludeIds;
        const filter = req.query.filter;
        const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const ids = arr.map(Number).filter(Number.isFinite);
        const where = {};
        if (filter !== "" && filter !== undefined) {
            where[Op.or] = [
                { name: { [Op.like]: `${filter}%` } },
                { description: { [Op.like]: `${filter}%` } },
                { custom_id: { [Op.like]: `${filter}%` } },
            ];
        }
        if (ids.length > 0) {
            where.id = { [Op.notIn]: ids };
        }
        try {
            const results = await InputModel.findAll({
                where: where,
                attributes: InputModel.getAllFields()
            });
            if (!(results.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const products = results.map((p) => p.toJSON());
            res.status(200).json(products);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getInputsWithInputType = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await InputModel.findOne({
                where: { id: id },
                attributes: InputModel
                    .getAllFields(),
                include: [
                    {
                        model: InputTypeModel,
                        as: "input_types",
                        attributes: InputTypeModel
                            .getAllFields()
                    }
                ]
            });
            if (!response) {
                res.status(404).json(null);
                return;
            }
            const formattedInputs = await formatWithBase64([response], "photo");
            res.status(200).json(formattedInputs.shift());
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ` +
                    `${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await InputModel.findByPk(id);
            if (!response) {
                res.status(404).json(null);
                return;
            }
            const [formattedInputs] = await formatWithBase64([response], "photo");
            res.status(200).json(formattedInputs);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ` +
                    `${error}`);
            }
        }
    };
    static getByName = async (req, res, next) => {
        const { name } = req.params;
        try {
            const response = await InputModel.findOne({
                where: { name: name }
            });
            if (!response) {
                res.status(404).json(null);
                return;
            }
            const [formattedInput] = await formatWithBase64([response], "photo");
            res.status(200).json(formattedInput);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ` +
                    `${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { name, custom_id, input_types_id, unit_cost, supplier, photo, status, description, barcode, storage_conditions, sku, unit_of_measure } = req.body;
        try {
            const validateName = await InputModel.findOne({
                where: { name: name }
            });
            if (validateName) {
                if (photo)
                    await ImageHandler.removeImageIfExists(photo);
                res.status(409).json({
                    validation: "The name is already currently in use by a input"
                });
                return;
            }
            const validatePhoto = await InputModel.findOne({
                where: { photo: photo }
            });
            if (validatePhoto) {
                if (photo)
                    await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation: "This path already exists and is currently referencing an image"
                });
                return;
            }
            const validateType = await InputTypeModel.findOne({
                where: { id: input_types_id }
            });
            if (!validateType) {
                if (photo)
                    await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation: "The assigned type does not exist"
                });
                return;
            }
            const response = await InputModel.create({
                name,
                description: description ?? null,
                custom_id: custom_id ?? null,
                input_types_id: input_types_id ?? null,
                unit_cost: unit_cost ?? null,
                supplier: supplier ?? null,
                photo: photo ?? null,
                status: status ?? null,
                barcode: barcode ?? null,
                storage_conditions: storage_conditions ?? null,
                sku: sku ?? null,
                unit_of_measure: unit_of_measure ?? null
            });
            if (!response) {
                if (photo)
                    await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation: "The input could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Input created successfully"
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
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
        });
        const { name, custom_id, input_types_id, unit_cost, supplier, storage_conditions, photo, status, presentation, description, is_draft, barcode, unit_of_measure, sku } = req.body;
        try {
            const validateName = await InputModel.
                findOne({ where: { name: name } });
            if (validateName) {
                if (photo)
                    await ImageHandler.removeImageIfExists(photo);
                res.status(409).json({
                    validation: normalizeValidationArray([
                        `The name is already`
                            + ` currently in use by a input`
                    ])
                });
                return;
            }
            const responseInput = await InputModel.create({
                presentation: presentation ?? null,
                name: name ?? null,
                description: description ?? null,
                custom_id: custom_id ?? null,
                input_types_id: input_types_id ?? null,
                unit_cost: unit_cost ?? null,
                supplier: supplier ?? null,
                photo: photo ?? null,
                status: status ?? null,
                barcode: barcode ?? null,
                storage_conditions: storage_conditions ?? null,
                sku: sku ?? null,
                unit_of_measure: unit_of_measure ?? null,
                is_draft: is_draft ?? 0
            }, { transaction });
            if (!responseInput) {
                if (photo)
                    await ImageHandler.removeImageIfExists(photo);
                res.status(500).json({
                    validation: normalizeValidationArray([
                        "The input could not be created"
                    ])
                });
                return;
            }
            const product = responseInput.toJSON();
            await transaction.commit();
            res.status(201).send(product);
        }
        catch (error) {
            await transaction.rollback();
            if (photo)
                await ImageHandler.removeImageIfExists(photo);
            if (error instanceof Error)
                next(error);
            else
                console.error(`An unexpected error ocurred ${error}`);
        }
    };
    static updateComplete = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
        });
        const { id } = req.params;
        const completeBody = req.body;
        let urlImageOld = "";
        let IsupdateImage = false;
        let isSuccessFully = false;
        try {
            const editableFields = InputModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, completeBody);
            const validateInput = await InputModel.findByPk(id, { transaction });
            if (!validateInput) {
                await transaction.rollback();
                if (completeBody.photo)
                    await ImageHandler.removeImageIfExists(completeBody.photo);
                res.status(404).json({
                    validation: normalizeValidationArray([
                        "Input not found"
                    ])
                });
                return;
            }
            const input = validateInput.toJSON();
            if (Object.keys(update_values).length) {
                if (update_values?.name) {
                    const validateName = await InputModel.findOne({
                        where: {
                            [Op.and]: [
                                { name: update_values.name },
                                { id: { [Op.ne]: id } }
                            ]
                        }
                    });
                    if (validateName) {
                        await transaction.rollback();
                        if (completeBody?.photo)
                            await ImageHandler.removeImageIfExists(completeBody.photo);
                        res.status(409).json({
                            validation: normalizeValidationArray([
                                `The name is already currently`
                                    + ` in use by a input`
                            ])
                        });
                        return;
                    }
                }
                if (update_values?.photo) {
                    IsupdateImage = true;
                    urlImageOld = input.photo;
                }
                if (update_values?.status)
                    update_values.status = toBoolean(update_values.status);
                if (update_values?.input_types_id) {
                    const validateInputType = await InputTypeModel.findByPk(update_values.input_types_id);
                    if (!validateInputType) {
                        await transaction.rollback();
                        if (completeBody?.photo)
                            await ImageHandler.removeImageIfExists(completeBody.photo);
                        res.status(404).json({
                            validation: normalizeValidationArray([
                                "Input type not found"
                            ])
                        });
                        return;
                    }
                }
                const responseInput = await InputModel.update(update_values, {
                    where: { id },
                    transaction: transaction,
                    individualHooks: true
                });
                if (!responseInput) {
                    await transaction.rollback();
                    if (completeBody?.photo) {
                        await ImageHandler
                            .removeImageIfExists(completeBody.photo);
                    }
                    res.status(500).json({
                        validation: normalizeValidationArray([
                            "The input could not be updated"
                        ])
                    });
                    return;
                }
            }
            await transaction.commit();
            isSuccessFully = !isSuccessFully;
            res.status(204).send({});
        }
        catch (error) {
            await transaction.rollback();
            if (completeBody?.photo)
                await ImageHandler.removeImageIfExists(completeBody.photo);
            if (error instanceof Error)
                next(error);
            else
                console.error(`An unexpected error ocurred ` + `${error}`);
        }
        finally {
            if (isSuccessFully && IsupdateImage && urlImageOld !== '' && urlImageOld !== undefined)
                await ImageHandler.removeImageIfExists(urlImageOld);
        }
    };
    static update = async (req, res, next) => {
        const body = req.body;
        const { id } = req.params;
        try {
            const editableFields = InputModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            const validateInput = await InputModel
                .findOne({ where: { id: id } });
            if (!validateInput) {
                if (update_values?.photo) {
                    await ImageHandler
                        .removeImageIfExists(update_values.photo);
                }
                res.status(200).json({
                    validation: "Input no found"
                });
                return;
            }
            if (update_values?.name) {
                const validateName = await InputModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.name },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    if (update_values?.photo) {
                        await ImageHandler
                            .removeImageIfExists(update_values.photo);
                    }
                    res.status(409).json({
                        validation: `The name is already currently ` +
                            `in use by a Input`
                    });
                    return;
                }
            }
            if (update_values?.input_types_id) {
                const validateType = await InputTypeModel.findOne({
                    where: { id: update_values.input_types_id }
                });
                if (!validateType) {
                    if (update_values?.photo) {
                        await ImageHandler
                            .removeImageIfExists(update_values.photo);
                    }
                    res.status(404).json({
                        validation: "The assigned type does not exist"
                    });
                    return;
                }
            }
            const response = await InputModel.update(update_values, { where: { id: id }, individualHooks: true });
            if (!(response[0] > 0)) {
                if (update_values?.photo) {
                    await ImageHandler
                        .removeImageIfExists(update_values.photo);
                }
                res.status(500).json({
                    validation: `Input no found or no `
                        + `changes were made`
                });
                return;
            }
            if (update_values?.photo) {
                const inputAux = validateInput.toJSON();
                if (inputAux.photo) {
                    await ImageHandler.removeImageIfExists(inputAux.photo);
                }
            }
            res.status(204).send({});
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ` +
                    `${error}`);
            }
        }
    };
    static delete = async (req, res, next) => {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
        });
        const { id } = req.params;
        try {
            const valiadDelete = await InputModel.findByPk(id, { transaction });
            if (!valiadDelete) {
                transaction.rollback();
                res.status(404).json({
                    validation: normalizeValidationArray([
                        "Input not found for deleted"
                    ])
                });
                return;
            }
            const inputDelete = valiadDelete.toJSON();
            const validateDelete = await sequelize.query(`SELECT func_input_is_asigned_product(:id) AS is_asigned`, {
                type: QueryTypes.SELECT,
                replacements: {
                    id: id
                }
            });
            const responseValidation = validateDelete.shift();
            if (responseValidation.is_asigned) {
                transaction.rollback();
                res.status(409).json({
                    validation: normalizeValidationArray([
                        `The input is currently assigned `
                            + `to a product, you cannot delete it`
                    ])
                });
                return;
            }
            const response = await InputModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!response) {
                transaction.rollback();
                res.status(404).json({
                    validation: normalizeValidationArray([
                        "Input not found for deleted"
                    ])
                });
                return;
            }
            transaction.commit();
            if (inputDelete.photo)
                await ImageHandler.removeImageIfExists(inputDelete.photo);
            res.status(204).send({});
        }
        catch (error) {
            transaction.rollback();
            if (error instanceof Error)
                next(error);
            else
                console.error(`An unexpected error ocurred: ${error} `);
        }
    };
}
export default InputController;
