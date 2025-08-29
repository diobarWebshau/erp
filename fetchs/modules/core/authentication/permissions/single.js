import fetch from 'node-fetch';

// Definimos el objeto de permiso
const permission = {
    name: "Superuser"
};

// Función para enviar un solo permiso
const sendPermission = async () => {
    try {
        const response = await fetch('http://localhost:3003/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(permission),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Permiso enviado correctamente: ${permission.name}`);
        } else {
            console.error(`Error al enviar el permiso ${permission.name}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar el permiso:", error);
    }
};

// Llamada para enviar un solo permiso
export default sendPermission;
