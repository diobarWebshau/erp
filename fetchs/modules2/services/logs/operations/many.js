import fetch from 'node-fetch';

const operationsData = [
    { name: "create" },
    { name: "update" },
    { name: "delete" }
];

const sendOperation = async (data) => {
    try {
        const response = await fetch(
            'http://localhost:3003/logs/operations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const contentType = response.headers.get('content-type');

        if (response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const responseData = await response.json();
                console.log(responseData);
            } else {
                const text = await response.text();
                console.warn(text);
            }
        } else {
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                console.error(errorData);
            } else {
                const errorText = await response.text();
                console.error(errorText);
            }
        }
    } catch (error) {
        console.error('Error al enviar operación:', error.message);
    }
};

const sendMultipleOperations = async () => {
    for (let i = 0; i < operationsData.length; i++) {
        await sendOperation(operationsData[i]);
    }
};

export default sendMultipleOperations;
