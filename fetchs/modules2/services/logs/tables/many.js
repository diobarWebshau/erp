import fetch from 'node-fetch';

const tableData = [
    { name: "users", table_name: "users" },
    { name: "logs", table_name: "logs" },
    { name: "tables", table_name: "tables" }
];

const sendTableData = async (table) => {
    try {
        const response = await fetch('http://localhost:3003/logs/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(table),
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
        console.error('Error al enviar los datos de la tabla:', error.message);
    }
};

const sendMultipleTableData = async () => {
    for (let i = 0; i < tableData.length; i++) {
        const table = tableData[i];
        await sendTableData(table);
    }
};


export default sendMultipleTableData;
