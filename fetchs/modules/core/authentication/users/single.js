import fetch from 'node-fetch';

const user = {
    username: "john_doe",
    password: "Securepassword123*",
    role_id: 1
};

const sendUser = async () => {
    try {
        const response = await fetch('http://localhost:3003/users', {
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

export default sendUser;
