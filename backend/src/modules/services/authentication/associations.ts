import RolePermissionModel
    from "./models/junctions/roles-permissions.model.js";
import PermissionModel
    from "./models/base/Permissions.model.js";
import RoleModel
    from "./models/base/Roles.model.js";
import UserModel
    from "./models/references/Users.model.js";

/** Permission-Role
 * Un role puede tener muchos permissions
 * Un permission puede tener muchos roles
 */

PermissionModel.hasMany(RolePermissionModel, {
    foreignKey: "permission_id",
    as: "role_permissions"
});

RoleModel.hasMany(RolePermissionModel, {
    foreignKey: "role_id",
    as: "role_permissions"
});

RolePermissionModel.belongsTo(PermissionModel, {
    foreignKey: "permission_id",
    as: "permissions",
    onDelete: "CASCADE"
});

RolePermissionModel.belongsTo(RoleModel, {
    foreignKey: "role_id",
    as: "roles",
    onDelete: "CASCADE"
});


/* Role-User
*Un role puede tener muchos users, pero un user solo
puede tener solo un role
*/

RoleModel.hasMany(
    UserModel, {
    foreignKey: "role_id",
    as: "users"
});

UserModel.belongsTo(
    RoleModel, {
    foreignKey: "role_id",
    as: "role",
    onDelete: "SET NULL"
});

export {
    PermissionModel,
    RoleModel,
    RolePermissionModel,
    UserModel
};
