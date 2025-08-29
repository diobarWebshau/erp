import sendMultiplePermissions
    from "./permissions/many.js";
import sendMultipleRoles
    from "./roles/many.js";
import sendMultipleUsers
    from "./users/many.js";
import sendMultipleRolePermission
    from "./rolespermissions/many.js";

const insertDataModuleAuthentication = async () => {
    try {
        await sendMultiplePermissions();
        await sendMultipleRoles();
        await sendMultipleRolePermission();
        await sendMultipleUsers();
    } catch (error) {
        console.error(error.message);
    }
}

export default insertDataModuleAuthentication;