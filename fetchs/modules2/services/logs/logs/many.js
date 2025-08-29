import fetch from 'node-fetch';

const logData = [
    {
        operation_id: 1,
        table_id: 1,
        user_id: 1,
        old_data: { field1: "oldValue1" },
        new_data: { field1: "newValue1" },
        message: "Update record 1"
    },
    {
        operation_id: 2,
        table_id: 2,
        user_id: 2,
        old_data: { field2: "oldValue2" },
        new_data: { field2: "newValue2" },
        message: "Update record 2"
    },
    {
        operation_id: 3,
        table_id: 3,
        user_id: 3,
        old_data: { field3: "oldValue3" },
        new_data: { field3: "newValue3" },
        message: "Update record 3"
    }
];

const sendLogData = async (log) => {
    try {
        const response = await fetch('http://localhost:3003/logs/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
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
        console.error('Error al enviar los datos del log:', error.message);
    }
};

const sendMultipleLogData = async () => {
    for (let i = 0; i < logData.length; i++) {
        const log = logData[i];
        await sendLogData(log);
    }
};


export default sendMultipleLogData;
