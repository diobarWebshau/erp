import fetch from 'node-fetch';

// Lista de permisos
const permissions = [
    { name: "read" },     
    { name: "write" },    
    { name: "delete" },   
    { name: "execute" },  
    { name: "manage" }   
];

// Función para enviar un solo permiso
const sendPermission = async (permission) => {
    try {
        const response = await fetch('http://localhost:3003/authentication/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(permission),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.error(`Error al enviar el permiso ${permission.name}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar el permiso:", error);
    }
};

// Función para enviar múltiples permisos de forma secuencial
const sendMultiplePermissions = async () => {
    for (let i = 0; i < permissions.length; i++) {
        await sendPermission(permissions[i]);
    }
};

// Llamada para enviar permisos
export default sendMultiplePermissions;
