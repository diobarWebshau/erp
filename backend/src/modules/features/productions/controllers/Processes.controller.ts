import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { ProcessModel }
    from "../associations.js";
import { Op }
    from "sequelize";
import { Request, Response, NextFunction }
    from "express";

class ProcessesController {

    // static getAll = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const response = await sequelize.query(
    //             "SELECT func_get_items()",
    //             { type: QueryTypes.SELECT }
    //         );

    //         if (response.length === 0) {
    //             res.status(200).json({ validation: "Processes not found" });
    //             return;
    //         }

    //         const raw = response[0];

    //         const items = typeof raw === "string" ? JSON.parse(raw) : raw;

    //         res.status(200).json(items);

    //     } catch (error: unknown) {
    //         if (error instanceof Error) {
    //             next(error);
    //         } else {
    //             console.error(`An unexpected error occurred ${error}`);
    //         }
    //     }
    // }

    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await ProcessModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Processes no found" });
                return;
            }
            const processes = response.map(p => p.toJSON());
            res.status(200).json(processes);
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
            const response = await ProcessModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "Process no found" });
                return;
            }
            const process = response.toJSON();
            res.status(200).json(process);
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
            const response = await ProcessModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Process no found" });
                return;
            }
            const process = response.toJSON();
            res.status(200).json(process);
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
            const validateName =
                await ProcessModel.findOne({ where: { name: name } });
            if (validateName) {
                res.status(200).json({
                    validation:
                        "The name is already currently in use by a process"
                });
                return;
            }
            const response = await ProcessModel.create({ name });
            if (!response) {
                res.status(200).json({
                    validation: "The process could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Process created successfully"
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
        const body = req.body;
        const { id } = req.params;
        try {
            const validatedProcess = await ProcessModel.findOne({ where: { id: id } });
            if (!validatedProcess) {
                res.status(200).json({ validation: "Process not found" });
                return;
            }
            const editableFields = ProcessModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (update_values?.name) {
                const validateName = await ProcessModel.findOne({
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
                            "The name is already currently in use by a process"
                    });
                    return;
                }
            }
            const response = await ProcessModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the process"
                });
                return;
            }
            res.status(200).json({ message: "Process updated succefally" });
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
            const response = await ProcessModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "Process not found for deleted"
                });
                return;
            }
            res.status(200).json({
                message: "Process deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}

export default ProcessesController;