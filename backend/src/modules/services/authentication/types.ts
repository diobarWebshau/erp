import {
    PermissionAttributes, PermissionCreationAttributes
} from "./models/base/Permissions.model.js";
import {
    RoleAttributes, RoleCreationAttributes
} from "./models/base/Roles.model.js";
import {
    RolePermissionAttributes, RolePermissionCreationAttributes
} from "./models/junctions/roles-permissions.model.js";
import {
    UserAttributes, UserCreationAttributes
} from "./models/references/Users.model.js"

export type {
    PermissionAttributes, PermissionCreationAttributes,
    RoleAttributes, RoleCreationAttributes,
    RolePermissionAttributes, RolePermissionCreationAttributes,
    UserAttributes, UserCreationAttributes,
}