import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { PermissionModel, RoleModel }
    from "../associations.js";
import { Request, Response, NextFunction }
    from "express";
import { Op } from "sequelize";

class PermissionController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await PermissionModel.findAll();
            if (response.length < 1) {
                res.status(200).json({ validation: "Permissions no found" });
                return;
            }
            const permissions = response.map(u => u.toJSON());
            res.status(200).json(permissions);
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
            const response = await PermissionModel.findByPk(id);
            if (!response) {
                res.status(200).json({ validation: "Permission no found" });
                return;
            }
            const permission = response.toJSON();
            res.status(200).json(permission);
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
            const response = await PermissionModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Permission not found" });
                return;
            }
            const permission = response.toJSON();
            res.status(200).json(permission);
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
            const validationName = await PermissionModel.findOne({
                where: { name: name }
            });
            if (validationName) {
                res.status(200).json({
                    validation: "The name is already used in a permission"
                });
                return;
            }
            const response = await PermissionModel.create({ name: name });
            if (!response) {
                res.status(200).json({
                    validation: "The permission could not be created"
                });
                return;
            }
            res.status(201).json({ message: "Permission created successfully" })
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
            const validatedPermission = await PermissionModel.findByPk(id);
            if (!validatedPermission) {
                res.status(200).json({
                    validation: "Permission not found"
                });
                return;
            }
            const editableFields = PermissionModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation:
                        "There are no validated permission properties for the update"
                });
                return;
            }
            const validateName = await PermissionModel.findOne({
                where: {
                    [Op.and]: [
                        { name: update_values.name, },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateName) {
                res.status(200).json({
                    validation: "The name is already used in a permission"
                });
                return;
            }
            const response = await PermissionModel.update(
                update_values,
                {
                    where: { id: id },
                    individualHooks: true
                }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the permission"
                });
                return;
            }
            res.status(200).json({ message: "Permission updated successfully" });
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
            const response = await PermissionModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (response < 1) {
                res.status(200).json({ validation: "Permission not found for deleted" });
                return;
            }
            res.status(200).json({ message: "Permission deleted successfully" })
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getRolesWithPermission = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validatedPermission = await PermissionModel.findByPk(id);
            if (!validatedPermission) {
                res.status(200).json({
                    validation: "The permission does not exist"
                });
                return;
            }
            const response = await PermissionModel.findAll({
                where: { id: id },
                attributes: [...PermissionModel.getAllFields()],
                include: [{
                    model: RoleModel,
                    as: "roles",
                    attributes: [...RoleModel.getAllFields()]
                }]
            });
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "No roles found for the permission"
                });
                return;
            }
            const roles = response.map(r => r.toJSON());
            res.status(200).json(roles);
        } catch (error) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}

export default PermissionController;