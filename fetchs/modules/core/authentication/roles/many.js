import fetch from 'node-fetch';

const roles = [
    { name: "Manager", permission_id: 1 },
    { name: "Supervisor", permission_id: 2 },
    { name: "Assistant", permission_id: 3 }
];

const sendRole = async (role) => {
    try {
        const response = await fetch('http://localhost:3003/authentication/roles', {
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

const sendMultipleRoles = async () => {
    for (let i = 0; i < roles.length; i++) {
        await sendRole(roles[i]);
    }
};

export default sendMultipleRoles;
