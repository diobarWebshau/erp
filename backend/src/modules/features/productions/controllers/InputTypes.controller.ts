import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { Request, Response, NextFunction }
    from "express";
import { InputModel, InputTypeModel }
    from "../associations.js";
import { Op }
    from "sequelize";

class InputTypesController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await InputTypeModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Input types no found" });
                return;
            }
            const InputTypes = response.map(p => p.toJSON());
            res.status(200).json(InputTypes);
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
            const response = await InputTypeModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "Input type no found" });
                return;
            }
            const inputType = response.toJSON();
            res.status(200).json(inputType);
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
            const response = await InputTypeModel.findOne({
                where: { name: name }
            });
            if (!response) {
                res.status(200).json({
                    validation:
                        "Input type no found"
                });
                return;
            }
            const inputType = response.toJSON();
            res.status(200).json(inputType);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body;
        try {
            const validateName = await InputTypeModel.findOne({
                where: { name: name }
            })
            if (validateName) {
                res.status(200).json({
                    validation:
                        "The name is already currently in use by a input type"
                });
                return;
            }
            const response = await InputTypeModel.create({ name });
            if (!response) {
                res.status(200).json({
                    validation:
                        "The input type could not be created"
                });
                return;
            }
            res.status(201).json({
                message:
                    "Input type created successfully"
            })
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
            const validateInputType = await InputTypeModel.findOne({
                where: { id: id }
            });
            if (!validateInputType) {
                res.status(200).json({
                    validation: "Input type no found"
                });
                return;
            }
            const editableFields = InputTypeModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "No validated  inputs properties were found for updating"
                });
                return;
            }
            if (update_values?.name) {
                const validateName = await InputTypeModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.name },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    res.status(200).json({
                        validation:
                            "The name is already currently in use by a input type"
                    });
                    return;
                }
            }
            const response = await InputTypeModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "The input type could not be created"
                })
                return;
            }
            res.status(200).json({
                message: "Input type updated succefally"
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
            const response = await InputTypeModel.destroy({ where: { id: id }, individualHooks: true });
            if (!(response > 0)) {
                res.status(200).json({ validation: "Input type not found for deleted" });
                return;
            }
            res.status(200).json({ message: "Input type deleted successfully" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getInputsWithThisType = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validateInputType = await InputTypeModel.findOne({
                where: { id: id }
            });
            if (!validateInputType) {
                res.status(200).json({
                    validation: "Input type does not exist."
                });
            }
            const response = await InputTypeModel.findAll({
                where: { id: id },
                attributes: InputTypeModel.getAllFields(),
                include: [{
                    model: InputModel,
                    as: "inputs",
                    attributes: InputModel.getAllFields(),
                }]
            });
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation:
                        "Inputs no found for this input type"
                });
                return;
            }
            const inputs = response.map(i => i.toJSON());
            res.status(200).json(inputs);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}

export default InputTypesController;