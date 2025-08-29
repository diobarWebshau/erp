import fetch from 'node-fetch';

const inventoryLineProducts = [
  {
    inventory_id: 1,
    line_products_id: 1
  },
  {
    inventory_id: 2,
    line_products_id: 2
  },
  {
    inventory_id: 3,
    line_products_id: 3
  }
];

const sendInventoryLineProduct = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/inventories-locations-production-lines-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Asociación inventario-línea-producto creada:', result);
    } else {
      const errorText = await response.text();
      console.error('Error al crear asociación:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error.message);
  }
};

const sendMultipleInventoryLineProducts = async () => {
  for (const data of inventoryLineProducts) {
    await sendInventoryLineProduct(data);
  }
};

export default sendMultipleInventoryLineProducts;
