import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { RoleModel, PermissionModel, UserModel }
    from "../associations.js"
import { Request, Response, NextFunction }
    from "express";
import { Op }
    from "sequelize";

class RolesController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await RoleModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Roles not found" });
                return;
            }
            const roles = response.map(r => r.toJSON());
            res.status(200).json(roles);
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
            const response = await RoleModel.findByPk(id);
            if (!response) {
                res.status(200).json({ validation: "Role not found" });
                return;
            }
            const rol = response.toJSON();
            res.status(200).json(rol);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static getByName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        try {
            const response = await RoleModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ valdiation: "Role not found" });
                return;
            }
            const rol = response.toJSON();
            res.status(200).json(rol);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body
        try {
            const validation_name = await RoleModel.findOne({ where: { name: name } });
            if (validation_name) {
                res.status(200).json({
                    validation: "The name is already used in a role"
                });
                return;
            }
            const response = await RoleModel.create({ name });
            if (!response) {
                res.status(200).json({ validation: "The role could not be created" });
                return;
            }
            res.status(200).json({ message: "Role created succefally" });
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
            const validateRol = RoleModel.findByPk(id);
            if (!validateRol) {
                res.status(200).json({ validation: "Role not found" });
                return;
            }
            const editableFields = RoleModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation:
                        "There are no validated role properties for the update"
                });
                return;
            }
            if (update_values?.name) {
                const validateName = await RoleModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.name, },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    res.status(200).json({
                        validation: "The name is already used in a role"
                    });
                    return;
                }
            }
            const response = await RoleModel.update(
                update_values,
                {
                    where: { id: id },
                    individualHooks: true
                }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the role"
                });
                return;
            }
            res.status(200).json({ message: "Role updated successfully" });
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
            const response = await RoleModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "Role no found for deleted" });
                return;
            }
            res.status(200).json({ message: "Role deleted successfully" })
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getUsersWithRole = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validatedRole = await RoleModel.findOne({ where: { id: id } });
            if (!validatedRole) {
                res.status(200).json({ validation: "The role does not exist" });
                return;
            }
            const response = await RoleModel.findAll({
                where: { id: id },
                attributes: [...RoleModel.getAllFields()],
                include: [{
                    model: UserModel,
                    attributes: [...UserModel.getAllFields()],
                    as: "users"
                }]
            });
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "No users found for the role" });
                return;
            }
            const users = response.map(u => u.toJSON());
            res.status(200).json(users);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}

export default RolesController;