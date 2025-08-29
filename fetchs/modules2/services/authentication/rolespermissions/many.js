import fetch from 'node-fetch';

const rolesPermissions = [
    {
        permission_id: 5,
        role_id: 1
    },
    {
        permission_id: 1,
        role_id: 2
    },
    {
        permission_id: 2,
        role_id: 2
    },
    {
        permission_id: 3,
        role_id: 2
    },
    {
        permission_id: 1,
        role_id: 3
    },
    {
        permission_id: 2,
        role_id: 3
    },
];

const sendRolePermission = async (role) => {
    try {
        const response = await fetch('http://localhost:3003/authentication/roles-permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(role),
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.error(`Error al enviar el rolepermissions` + response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar el rol:", error);
    }
};

const sendMultipleRolePermission = async () => {
    for (let i = 0; i < rolesPermissions.length; i++) {
        await sendRolePermission(rolesPermissions[i]);
    }
};

export default sendMultipleRolePermission;
