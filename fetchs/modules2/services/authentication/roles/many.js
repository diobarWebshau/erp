import fetch from 'node-fetch';

const roles = [
    { name: "SuperAdmin"},
    { name: "Admin"},
    { name: "Supervisor"}
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
            console.log(data);
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
