import fetch from 'node-fetch';
const process = {
    name: "Proceso A"
};
const sendProcess = async () => {
    try {
        const response = await fetch('http://localhost:3003/processes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(process),
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Proceso enviado correctamente: ${process.name}`);
        } else {
            console.error(`Error al enviar el proceso ${process.name}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar el proceso:", error);
    }
};
export default sendProcess;
