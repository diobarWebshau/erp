import fetch from 'node-fetch';

// Definimos el objeto del rol
const role = {
    name: "Manager",
    permission_id: 1
};

// Función para enviar un solo rol
const sendRole = async () => {
    try {
        const response = await fetch('http://localhost:3003/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(role),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Rol enviado correctamente: ${role.name}`);
        } else {
            console.error(`Error al enviar el rol ${role.name}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar el rol:", error);
    }
};

// Llamada para enviar un solo rol
export default sendRole;
