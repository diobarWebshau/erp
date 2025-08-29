import fetch from "node-fetch";

const inventories = [
    {
        stock: 1000,
        minimum_stock: 50,
        maximum_stock: 1000,
        lead_time: 20
    },
    {
        stock: 2000,
        minimum_stock: 50,
        maximum_stock: 2000,
        lead_time: 20
    },
    {
        stock: 1500,
        minimum_stock: 50,
        maximum_stock: 1500,
        lead_time: 20
    },
];

const sendInventory = async (inventory) => {
    try {
        const response = await fetch("http://localhost:3003/inventories/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(inventory)
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Inventory enviado correctamente: ${inventory.stock}`);
        } else {
            console.error(`Error al enviar el inventory ${inventory.stock}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar el inventory:", error);
    }
}

const sendMultipleInventories = async () => {
    for (let i = 0; i < inventories.length; i++) {
        await sendInventory(inventories[i]);
    }
};

export default sendMultipleInventories;