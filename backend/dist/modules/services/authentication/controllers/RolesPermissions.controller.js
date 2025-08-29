import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { RoleModel, PermissionModel, RolePermissionModel } from "../associations.js";
import { Op } from "sequelize";
class RolesPermissionsController {
    static getAll = async (req, res, next) => {
        try {
            const response = await RolePermissionModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({
                    validation: "No permissions have been assigned to any roles"
                });
                return;
            }
            const roles = response.map(r => r.toJSON());
            res.status(200).json(roles);
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
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await RolePermissionModel.findByPk(id);
            if (!response) {
                res.status(200).json({
                    validation: "No permissions have been assigned to the role"
                });
                return;
            }
            const rol = response.toJSON();
            res.status(200).json(rol);
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
    static create = async (req, res, next) => {
        const { permission_id, role_id } = req.body;
        try {
            const [validatePermission, validateRole] = await Promise.all([
                PermissionModel.findByPk(permission_id),
                RoleModel.findByPk(role_id)
            ]);
            if (!validatePermission) {
                res.status(200).json({
                    validation: "The assigned permission does not exist"
                });
                return;
            }
            if (!validateRole) {
                res.status(200).json({
                    validation: "The assigned role does not exist"
                });
                return;
            }
            const validateDuplicate = await RolePermissionModel.findOne({
                where: {
                    [Op.and]: [
                        { permission_id: permission_id },
                        { role_id: role_id }
                    ]
                }
            });
            if (validateDuplicate) {
                res.status(200).json({
                    validation: "This permission is already assigned to this role"
                });
                return;
            }
            const response = await RolePermissionModel.create({
                permission_id, role_id
            });
            if (!response) {
                res.status(200).json({
                    validation: "The permission could not be assigned to the role"
                });
                return;
            }
            res.status(200).json({
                message: "Permission successfully assigned to the role"
            });
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
    static update = async (req, res, next) => {
        const body = req.body;
        const { id } = req.params;
        try {
            const validateRolePermission = await RolePermissionModel.findByPk(id);
            if (!validateRolePermission) {
                res.status(404).json({
                    validation: "The permission assignment to the role was not found"
                });
                return;
            }
            const relationships = validateRolePermission.toJSON();
            const editableFields = RolePermissionModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "There are no validated role properties for the update"
                });
                return;
            }
            if (update_values?.permission_id || update_values?.role_id) {
                const [permission, role] = await Promise.all([
                    update_values.permission_id ?
                        PermissionModel.findByPk(update_values.permission_id) : null,
                    update_values.role_id ?
                        RoleModel.findByPk(update_values.role_id) : null
                ]);
                if (update_values?.permission_id && !permission) {
                    res.status(404).json({
                        validation: "The assigned permission does not exist"
                    });
                    return;
                }
                if (update_values?.role_id && !role) {
                    res.status(404).json({
                        validation: "The assigned role does not exist"
                    });
                    return;
                }
            }
            const validateDuplicate = await RolePermissionModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            permission_id: update_values.permission_id
                                || relationships.permission_id
                        },
                        {
                            role_id: update_values.role_id
                                || relationships.role_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateDuplicate) {
                res.status(409).json({
                    validation: "The assigned Permission to Role already exists"
                });
                return;
            }
            const response = await RolePermissionModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (response[0] === 0) {
                res.status(400).json({
                    validation: "No changes were made to the role"
                });
                return;
            }
            res.status(200).json({ message: "Role updated successfully" });
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
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await RolePermissionModel.destroy({
                where: { id: id }, individualHooks: true
            });
            if (response === 0) {
                res.status(404).json({
                    validation: "No permission assignment found for the specified role"
                });
                return;
            }
            res.status(200).json({
                message: "Permission successfully deleted from the role."
            });
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
}
export default RolesPermissionsController;
