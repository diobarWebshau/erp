import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import ImageHandler
    from "../../../../classes/ImageHandler.js";
import { InputModel, InputTypeModel }
    from "../../../associations.js";
import { Request, Response, NextFunction }
    from "express";
import { Op, QueryTypes, Transaction } from "sequelize";
import { formatWithBase64 }
    from "../../../../scripts/formatWithBase64.js";
import sequelize from "../../../../mysql/configSequelize.js";
import toBoolean from "../../../../scripts/toBolean.js";

class InputController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await InputModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const formattedInputs = await formatWithBase64(response, "photo");
            res.status(200).json(formattedInputs);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }

    static getInputsWithInputType = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        try {
            const response: InputModel | null =
                await InputModel.findOne({
                    where: { id: id },
                    attributes:
                        InputModel
                            .getAllFields(),
                    include: [
                        {
                            model: InputTypeModel,
                            as: "input_types",
                            attributes:
                                InputTypeModel
                                    .getAllFields()
                        }
                    ]
                });

            if (!response) {
                res.status(404).json(null);
                return;
            }
            const formattedInputs =
                await formatWithBase64(
                    [response],
                    "photo"
                );
            res.status(200).json(formattedInputs.shift());
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`);
            }
        }
    }


    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await InputModel.findByPk(id);
            if (!response) {
                res.status(404).json(null);
                return;
            }
            const [formattedInputs] = await formatWithBase64([response], "photo");
            res.status(200).json(formattedInputs);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`);
            }
        }
    }
    static getByName = async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { name, custom_id, input_types_id, unit_cost,
            supplier, photo, status, description, barcode } = req.body;
        try {
            const validateName = await InputModel.findOne({
                where: { name: name }
            });
            if (validateName) {
                await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation:
                        "The name is already currently in use by a input"
                });
                return;
            }
            const validatePhoto = await InputModel.findOne({
                where: { photo: photo }
            });
            if (validatePhoto) {
                await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation:
                        "This path already exists and is currently referencing an image"
                });
                return;
            }
            const validateType = await InputTypeModel.findOne({
                where: { id: input_types_id }
            });
            if (!validateType) {
                await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation: "The assigned type does not exist"
                });
                return;
            }
            const response = await InputModel.create({
                name,
                description: description ?? null,
                custom_id,
                input_types_id,
                unit_cost,
                supplier,
                photo,
                status,
                barcode: barcode ?? null
            });
            if (!response) {
                await ImageHandler.removeImageIfExists(photo);
                res.status(200).json({
                    validation: "The input could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Input created successfully"
            })
        } catch (error: unknown) {
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

        const transaction =
            await sequelize.transaction({
                isolationLevel:
                    Transaction
                        .ISOLATION_LEVELS
                        .REPEATABLE_READ
            });

        const {
            name, custom_id, input_types_id,
            unit_cost, supplier,
            photo, status,
            description,
            barcode
        } = req.body;

        try {

            const validateName =
                await InputModel.findOne({
                    where: { name: name }
                });

            if (validateName) {
                await ImageHandler
                    .removeImageIfExists(photo);
                res.status(400).json({
                    validation:
                        `The name is already`
                        + ` currently in use by a input`
                });
                return;
            }

            const responseInput =
                await InputModel.create({
                    name,
                    description: description ?? null,
                    custom_id,
                    input_types_id,
                    unit_cost,
                    supplier,
                    photo,
                    status,
                    barcode: barcode ?? null
                }, { transaction }
                );

            if (!responseInput) {
                await ImageHandler
                    .removeImageIfExists(photo);
                res.status(400).json({
                    validation:
                        "The input could not be created"
                });
                return;
            }

            await transaction.commit();

            res.status(201).json({
                message:
                    "Input created successfully"
            })

        } catch (error: unknown) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`
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
        console.log(completeBody);

        let urlImageOld: string = "";
        let IsupdateImage: boolean = false;
        let isSuccessFully: boolean = false;

        try {

            const editableFields =
                InputModel.getEditableFields();
            const update_values =
                collectorUpdateFields(
                    editableFields,
                    completeBody
                );

            const validateInput =
                await InputModel.findByPk(id);

            if (!validateInput) {
                await transaction.rollback();
                if (completeBody.photo) {
                    await ImageHandler
                        .removeImageIfExists(
                            completeBody.photo
                        );
                }
                res.status(404).json({
                    validation:
                        "Input not found"
                });
                return;
            }

            const input = validateInput.toJSON();

            if (Object.keys(update_values).length > 0) {

                if (update_values?.name) {
                    const validateName =
                        await InputModel.findOne({
                            where: {
                                [Op.and]: [
                                    { name: update_values.name },
                                    { id: { [Op.ne]: id } }
                                ]
                            }
                        });
                    if (validateName) {
                        await transaction.rollback();
                        if (completeBody?.photo) {
                            await ImageHandler
                                .removeImageIfExists(
                                    completeBody.photo
                                );
                        }
                        res.status(404).json({
                            validation:
                                `The name is already currently`
                                + ` in use by a input`
                        });
                        return;
                    }
                }

                if (update_values?.photo) {
                    IsupdateImage = true;
                    // console.log(typeof input.photo);
                    // console.log(update_values.photo);
                    urlImageOld = input.photo;
                }

                if (update_values?.status) {
                    update_values.status =
                        toBoolean(update_values.status);
                }

                if (update_values?.input_types_id) {
                    const validateInputType =
                        await InputTypeModel
                            .findByPk(update_values.input_types_id);
                    if (!validateInputType) {
                        await transaction.rollback();
                        if (completeBody?.photo) {
                            await ImageHandler
                                .removeImageIfExists(
                                    completeBody.photo
                                );
                        }
                        res.status(404).json({
                            validation:
                                "Input type not found"
                        });
                        return;
                    }
                }

                console.log(update_values);
                const responseInput =
                    await InputModel.update(update_values, {
                        where: { id },
                        transaction: transaction
                    });

                if (!responseInput) {
                    await transaction.rollback();
                    if (completeBody?.photo) {
                        await ImageHandler
                            .removeImageIfExists(
                                completeBody.photo
                            );
                    }
                    res.status(400).json({
                        validation:
                            "The input could not be updated"
                    });
                    return;
                }
            }

            await transaction.commit();

            isSuccessFully = !isSuccessFully;


            res.status(201).json({
                message:
                    "Input updated successfully"
            })

        } catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`
                );
            }
        } finally {
            if (isSuccessFully && IsupdateImage &&
                urlImageOld !== ''
            ) {
                // console.log("Eliminando imagen vieja");
                // console.log(urlImageOld);
                await ImageHandler
                    .removeImageIfExists(
                        urlImageOld
                    );
            }
        }
    }

    static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const body = req.body;
        const { id } = req.params;
        try {

            const editableFields =
                InputModel.getEditableFields();

            const update_values =
                collectorUpdateFields(
                    editableFields,
                    body
                );
            const validateInput =
                await InputModel
                    .findOne({ where: { id: id } });

            if (!validateInput) {
                if (update_values?.photo) {
                    await ImageHandler
                        .removeImageIfExists(
                            update_values.photo
                        );
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
                            .removeImageIfExists(
                                update_values.photo
                            );
                    }
                    res.status(200).json({
                        validation:
                            `The name is already currently ` +
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
                            .removeImageIfExists(
                                update_values.photo
                            );
                    }
                    res.status(200).json({
                        validation:
                            "The assigned type does not exist"
                    });
                    return;
                }
            }
            const response = await InputModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (!(response[0] > 0)) {
                if (update_values?.photo) {
                    await ImageHandler
                        .removeImageIfExists(
                            update_values.photo
                        );
                }
                res.status(200).json({
                    validation:
                        `Input no found or no `
                        + `changes were made`
                })
                return;
            }
            if (update_values?.photo) {
                await ImageHandler
                    .removeImageIfExists(
                        validateInput.toJSON().photo
                    );
            }
            res.status(200).json({
                message:
                    "Input updated succefally"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`
                );
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

            const valiadDelete =
                await InputModel.findByPk(id);

            if (!valiadDelete) {
                res.status(200).json({
                    validation:
                        "Input not found for deleted"
                });
                return;
            }

            const inputDelete = valiadDelete.toJSON();

            interface ValidateDelete {
                is_asigned: number;
            }

            const validateDelete =
                await sequelize.query(
                    `SELECT func_input_is_asigned_product(:id)` +
                    ` AS is_asigned`,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            id: id
                        }
                    }
                ) as ValidateDelete[];

            const responseValidation =
                validateDelete.shift() as ValidateDelete;

            if (responseValidation.is_asigned > 0) {
                res.status(400).json({
                    validation:
                        `The input is currently assigned `
                        + `to a product, you cannot delete it`
                });
                return;
            }

            const response = await InputModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "Input not found for deleted"
                });
                return;
            }
            await ImageHandler
                .removeImageIfExists(inputDelete.photo);
            res.status(200).json({
                message:
                    "Input deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ` +
                    `${error}`
                );
            }
        }
    }
}
export default InputController;