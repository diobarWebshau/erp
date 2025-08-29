import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { UserModel, RoleModel }
    from "../associations.js";
import { generateHash }
    from "../../../../utils/argon/argon.js";
import { Request, Response, NextFunction }
    from "express";
import { Op }
    from "sequelize";

class UsersController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await UserModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Users no found" });
                return;
            }
            const users = response.map(u => u.toJSON());
            res.status(200).json(users);
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
            const response = await UserModel.findByPk(id);
            if (!response) {
                res.status(200).json({ validation: "User no found" });
                return;
            }
            const user = response?.toJSON();
            res.status(200).json(user);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static getByName = async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params;
        try {
            const response = await UserModel.findOne({
                where: {
                    username: username
                }
            });
            if (!response) {
                res.status(200).json({ validation: "User no found" });
                return;
            }
            const user = response.toJSON();
            res.status(200).json(user)
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { username, password, role_id } = req.body;
        try {
            const validationName = await UserModel.findOne({
                where: {
                    username: username
                }
            })
            if (validationName) {
                res.status(200).json({
                    validation: "The username is already currently in use by a user"
                });
                return;
            }
            const passwordHashed = await generateHash(password);
            if (!passwordHashed) {
                throw new Error("Password hashing failed");
            }
            const validateRol = await RoleModel.findByPk(role_id);
            if (!validateRol) {
                res.status(200).json({ validation: "The assigned role does not exist" });
                return;
            }
            const new_user = {
                username,
                role_id,
                "password": passwordHashed
            }
            const response = await UserModel.create(new_user);
            if (!response) {
                res.status(200).json({ validation: "The user could not be created" });
                return;
            }
            res.status(201).json({ message: "User created successfully" })
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const { id } = req.params;
        try {
            const validatedUser = await UserModel.findByPk(id);
            if (!validatedUser) {
                res.status(200).json({ validation: "User not found" });
                return;
            }
            const editableFields = UserModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation:
                        "There are no validated user properties for the update"
                });
                return;
            }
            if (update_values?.username) {
                const validateUsername = await UserModel.findOne({
                    where: {
                        [Op.and]: [
                            { username: update_values.username },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateUsername) {
                    res.status(200).json({
                        validation:
                            "The username is already currently in use by a user"
                    });
                    return;
                }
            }
            if (update_values?.role_id) {
                const validateRol = await RoleModel.findOne({
                    where: { id: update_values.role_id }
                });
                if (!validateRol) {
                    res.status(200).json({
                        validation: "The assigned role does not exist"
                    });
                    return;
                }
            }
            const response = await UserModel.update(
                update_values,
                { where: { id: id }, individualHooks: true }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the user"
                });
                return;
            }
            res.status(200).json({ message: "User updated succefally" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await UserModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "User not found for deleted"
                });
                return;
            }
            res.status(200).json({
                message: "User deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
}
export default UsersController;