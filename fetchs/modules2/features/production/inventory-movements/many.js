import fetch
    from "node-fetch";

const inventoryMovements = [
    // Location 1
    {
        location_id: 1,
        location_name: "Location A",
        item_type: "input",
        item_id: 1,
        qty: 3000.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 1,
        location_name: "Location A",
        item_type: "input",
        item_id: 2,
        qty: 5000.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 1,
        location_name: "Location A",
        item_type: "product",
        item_id: 1,
        qty: 1000.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 1,
        location_name: "Location A",
        item_type: "product",
        item_id: 2,
        qty: 1000.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 1,
        location_name: "Location A",
        item_type: "product",
        item_id: 3,
        qty: 1000.0000,
        movement_type: "in",
        reference_type: "Purchased"
    },
    // Location 2
    {
        location_id: 2,
        location_name: "Location B",
        item_type: "input",
        item_id: 1,
        qty: 2000.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 2,
        location_name: "Location B",
        item_type: "input",
        item_id: 2,
        qty: 6000.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 2,
        location_name: "Location B",
        item_type: "product",
        item_id: 1,
        qty: 700.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 2,
        location_name: "Location B",
        item_type: "product",
        item_id: 2,
        qty: 1000.0000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    // Location 3
    {
        location_id: 3,
        location_name: "Location C",
        item_type: "input",
        item_id: 1,
        qty: 8000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 3,
        location_name: "Location C",
        item_type: "input",
        item_id: 2,
        qty: 6000,
        movement_type: "in",
        reference_type: "Purchased",
    },
    {
        location_id: 3,
        location_name: "Location C",
        item_type: "product",
        item_id: 1,
        qty: 500,
        movement_type: "in",
        reference_type: "Purchased",
    },
]

const sendInventoryMovement = async (data) => {
    try {
        const response = await fetch(
            "http://localhost:3003/production/inventory-movements",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
        );
        const contentType = response.headers.get("content-type");
        if (response.ok) {
            if (contentType
                && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(data);
            } else {
                const text = await response.text();
                console.warn(text);
            }
        } else {
            if (contentType
                && contentType.includes('application/json')) {
                const errorData = await response.json();
                console.error(errorData);
            } else {
                const errorText = await response.text();
                console.error(errorText);
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

const sendMultipleInventoryMovement = async () => {
    for (const movements of inventoryMovements) {
        await sendInventoryMovement(movements);
    }
}


// try {
//     await sendMultipleInventoryMovement();
// } catch (error) {
//     console.error(error.message);
// }

export default sendMultipleInventoryMovement;

