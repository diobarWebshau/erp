import fetch from 'node-fetch';

// Lista de usuarios
const users = [
    { username: "john_doe", password: "Securepassword123*", role_id: 1 },
    { username: "jane_doe", password: "Anotherpassword456*", role_id: 2 },
    { username: "alice_smith", password: "Password789*", role_id: 3 }
];

const sendUser = async (user) => {
    try {
        const response = await fetch('http://localhost:3003/authentication/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Usuario enviado correctamente: ${user.username}`);
        } else {
            console.error(`Error al enviar el usuario ${user.username}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar el usuario:", error);
    }
};

const sendMultipleUsers = async () => {
    for (let i = 0; i < users.length; i++) {
        await sendUser(users[i]);
    }
};

export default sendMultipleUsers;
