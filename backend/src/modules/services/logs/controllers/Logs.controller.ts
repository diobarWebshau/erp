import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { Request, Response, NextFunction }
    from "express";
import { LogModel, OperationModel, TableModel }
    from "../associations.js";
import { UserModel }
    from "../../associations.js";

class LogsController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await LogModel.findAll();
            if (response.length < 1) {
                res.status(200).json({ validation: "Logs no found" });
                return;
            }
            const logs = response.map(u => u.toJSON());
            res.status(200).json(logs);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await LogModel.findByPk(id);
            if (!response) {
                res.status(200).json({ validation: "Log no found" });
                return;
            }
            const log = response.toJSON();
            res.status(200).json(log);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getByOperationName = async (req: Request, res: Response, next: NextFunction) => {
        const { operation_name } = req.params;
        try {
            const response = await LogModel.findOne({
                where: { operation_name: operation_name }
            });
            if (!response) {
                res.status(200).json({ validation: "Logs not found" });
                return;
            }
            const logs = response.toJSON();
            res.status(200).json(logs);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getByTableName = async (req: Request, res: Response, next: NextFunction) => {
        const { table_name } = req.params;
        try {
            const response = await LogModel.findOne({
                where: { table_name: table_name }
            });
            if (!response) {
                res.status(200).json({ validation: "Logs not found" });
                return;
            }
            const logs = response.toJSON();
            res.status(200).json(logs);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getByUserName = async (req: Request, res: Response, next: NextFunction) => {
        const { user_name } = req.params;
        try {
            const response = await LogModel.findOne({
                where: { user_name:  user_name}
            });
            if (!response) {
                res.status(200).json({ validation: "Logs not found" });
                return;
            }
            const logs = response.toJSON();
            res.status(200).json(logs);
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
            table_id, user_id, operation_id,
            old_data, new_data, message
        } = req.body;
        try {

            const [validatedTable, validatedOperation, validateUser] =
                await Promise.all([
                    TableModel.findByPk(table_id),
                    OperationModel.findByPk(operation_id),
                    UserModel.findByPk(user_id)
                ]);

            if (!validatedTable) {
                res.status(200).json({
                    validation:
                        "The table assigned does not exist"
                });
                return;
            }
            if (!validatedOperation) {
                res.status(200).json({
                    validation:
                        "The operation assigned does not exist"
                });
                return;
            }
            if (!validateUser) {
                res.status(200).json({
                    validation:
                        "The user assigned does not exist"
                });
                return;
            }
            const user = validateUser.toJSON();
            const operation = validatedOperation.toJSON();
            const table = validatedTable.toJSON();
            const response = await LogModel.create({
                table_id,
                operation_id,
                user_id,
                user_name: user.username,
                operation_name: operation.name,
                table_name: table.name,
                old_data: old_data,
                new_data: new_data,
                message
            });
            if (!response) {
                res.status(200).json({ validation: "The log could not be created" });
                return;
            }
            res.status(201).json({ message: "Log created successfully" })
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
            const validatedlog = await LogModel.findOne({ where: { id: id } });
            if (!validatedlog) {
                res.status(200).json({ validation: "Log not found" });
                return;
            }
            const editableFields = LogModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation:
                        "There are no validated log properties for the update"
                });
                return;
            }
            const response = await LogModel.update(
                update_values,
                { where: { id: id } }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({ validation: "No changes were made to the log" });
                return;
            }
            res.status(200).json({ message: "Log updated successfully" });
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
            const response = await LogModel.destroy({ where: { id: id } });
            if (response < 1) {
                res.status(200).json({ validation: "Log not found for deleted" });
                return;
            }
            res.status(200).json({ message: "Log deleted successfully" })
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}

export default LogsController;