import fetch from 'node-fetch';

const processes = [
    { name: "Proceso A" },
    { name: "Proceso B" },
    { name: "Proceso C" }
];

const sendProcess = async (process) => {
    try {
        const response = await fetch('http://localhost:3003/products/processes', {
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

const sendMultipleProcesses = async () => {
    for (let i = 0; i < processes.length; i++) {
        await sendProcess(processes[i]);
    }
};

export default sendMultipleProcesses;
